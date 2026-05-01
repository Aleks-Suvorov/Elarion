import type {
  NarrativeAdapter,
  NarrativeContext,
  NarrativeOutput,
  RollResult,
} from '../types';
import { mergedGenreProfile } from '../data/genres';
import { urgentClocks, formatTime } from '../engine/worldSim';
import {
  getAtmosphere,
  getTimeOfDayFlavour,
  getWeatherFlavour,
  getSeasonFlavour,
  getRandomSoundscape,
  getRandomSmell,
  getDangerCue,
} from '../data/immersion';

// ─── Template Tables ──────────────────────────────────────────

const SITUATION_TEMPLATES = [
  '{time_desc}. The air in {location} carries a {tone} edge. A {faction} operative watches the crowd — probably not looking for you, but old instincts die hard.',
  'The {climate} terrain of {location} stretches before you, {tone} and unforgiving. Somewhere ahead, {clock_hint} and time is not on your side.',
  'Inside {location}, the noise is a constant presence. {npc_name} catches your eye from across the space, their expression carefully neutral. Whatever they want, they\'re not going to ask quietly.',
  'Dawn breaks over {location}, pale and {weather_desc}. The settlement around you is still waking up, but the tension from last night hasn\'t dissipated. {clock_hint}.',
  'You arrive at {location} as the {time_of_day} sets in. The place looks different than you expected — more fortified, or perhaps less. Either way, something has changed since the last report.',
  'The market district of {location} is alive with movement, but the deals being struck aren\'t visible. {faction} forces have tripled their presence since yesterday. Someone knows something.',
  'Rain hammers {location} as {weather_desc} conditions push people inside. Out here, you\'re conspicuous — but so is anyone else moving with purpose.',
  'A contact left word that {location} would be safe. It isn\'t — {faction} patrols have been doubling up, and the safe house looks compromised. New plan needed, fast.',
  'The outer edge of {location} is quieter than the core, but quiet isn\'t the same as safe. Three routes forward, each with its own risk. {clock_hint}.',
  'You\'ve made it this far. {location} looms ahead, {tone} and full of unknowns. Your resources are at {resource_status}. The clock is ticking.',
  '{npc_name} sent a message that turned out to be about three layers more complicated than it looked. Now you\'re standing in {location}, with a simple question: how deep does this go?',
  'The heat in {location} is brutal — {weather_desc} conditions are slowing everyone down, which could work in your favour or against you depending on who moves first.',
  'Somewhere in {location} there is an answer. Maybe it\'s behind that door. Maybe it\'s in the pocket of {npc_name}. Maybe it\'s buried under three seasons of bad decisions. You start looking.',
  '{time_desc}, {location}. You\'ve got a window — small, defined, and closing. What you do in the next few minutes matters.',
  'The ruins of the old district in {location} are empty, except for echoes. {faction} abandoned this area a season ago. They left things behind. You\'re here to find out which things.',
  '{npc_name} is exactly where the intel said they\'d be, which is the first warning sign. People who are exactly where they\'re supposed to be in {location} are either bait or professionals.',
  'A fire alarm — literal or figurative — just went off somewhere in {location}. In the resulting chaos, three things become possible that weren\'t five minutes ago. {clock_hint}.',
  'You need to cross {location} without being noticed. The {faction} checkpoint on the main route rules out the direct approach. Detour time.',
  'Midday in {location}: the worst time for anything subtle. But the schedule isn\'t yours to set. You adapt.',
  '{npc_name} owes you a favour. This is when you collect, in the back corridors of {location}, while the rest of the world keeps its eyes on the bigger problem.',
  'The data pointed here. {location} matches three separate lead sources, which means either a solid breakthrough or an elaborate setup. You\'re about to find out which.',
  '{tone} silence hangs over {location} like a weight. Something happened here recently. The signs are obvious to anyone trained to look — disturbed ground, fresh scorch marks, a smell that doesn\'t belong.',
  '{clock_hint}. You\'re in {location}, and the only way forward is through. You take a breath and assess your options.',
  'Word reached you that {location} is unstable — regime shifts, faction purges, something that makes the locals nervous. You arrive to find the word was understated.',
];

const CONSEQUENCE_SUCCESS = [
  'It works. Not gracefully, not without cost, but it works.',
  'Success — and in the aftermath, a brief opening to exploit.',
  'The plan holds. For now, you\'re ahead.',
  'Done. The consequences ripple outward, some of them in your favour.',
  'You pull it off. The situation shifts — not fully resolved, but definitively moved.',
];

const CONSEQUENCE_FAILURE = [
  'It goes wrong. The world doesn\'t end, but the situation gets harder.',
  'Failure — and it costs something. Time, resources, position.',
  'The attempt fails. Something compensates: an escape route, a fallback plan.',
  'It doesn\'t work, and now they know you tried. Adapt.',
  'Bad result. The path forward just got narrower.',
];

const CONSEQUENCE_CRIT = [
  'Beyond expectations — a critical advantage opens up.',
  'Exceptional. The outcome exceeds what you planned for, and something extra falls into place.',
  'Perfect execution. There are ripple effects you can use.',
  'Outstanding success. Mark this — it\'s a turning point.',
];

const CONSEQUENCE_FUMBLE = [
  'Catastrophic failure. The situation deteriorates sharply.',
  'It goes spectacularly wrong. Immediate damage control required.',
  'Fumble — the worst possible version of a bad outcome. You\'re scrambling.',
  'Everything that could go wrong did. There\'s still a way out, but it\'s narrow.',
];

// ─── Context Helpers ──────────────────────────────────────────

function pick<T>(arr: T[], turn: number): T {
  return arr[turn % arr.length];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function timeOfDayDesc(hour: number): string {
  if (hour < 5) return 'the dead of night';
  if (hour < 8) return 'pre-dawn';
  if (hour < 12) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  if (hour < 23) return 'night';
  return 'late night';
}

function fillTemplate(
  template: string,
  ctx: NarrativeContext,
  genre: ReturnType<typeof mergedGenreProfile>
): string {
  const { location, world, character, turn, config } = ctx;
  const time = world.time;
  const weather = world.weather;
  const atmos = getAtmosphere(config.genre);

  const clockHint = urgentClocks(world.clocks)[0]
    ? `${urgentClocks(world.clocks)[0].name} is pressing`
    : 'the situation demands action';

  const nearbyNPC = world.npcs.find(
    (n) => n.alive && n.lastSeenRegion === location.regionId
  );
  // Prefer non-minor NPCs for narrative salience
  const narrativeNPC =
    world.npcs.find((n) => n.alive && n.lastSeenRegion === location.regionId && !n.isMinor)
    ?? nearbyNPC;

  const nearbyFaction = world.factions[0];
  const tone = pickRandom(genre.toneWords);
  const resourceStatus =
    character.tracks.hp.current / character.tracks.hp.max < 0.5
      ? 'critical'
      : 'manageable';

  // Immersion enrichment
  const timeAtmos = getTimeOfDayFlavour(config.genre, time.hour);
  const weatherAtmos = getWeatherFlavour(config.genre, weather.current);
  const seasonAtmos = getSeasonFlavour(config.genre, time.season);
  const soundscape = getRandomSoundscape(config.genre, turn);
  const smell = getRandomSmell(config.genre, turn + 3);

  return template
    .replace(/{location}/g, location.regionName)
    .replace(/{faction}/g, nearbyFaction?.name ?? 'an unknown force')
    .replace(/{npc_name}/g, narrativeNPC?.name ?? 'a familiar face')
    .replace(/{tone}/g, tone)
    .replace(/{climate}/g, world.regions.find((r) => r.id === location.regionId)?.climate ?? 'harsh')
    .replace(/{time_of_day}/g, timeOfDayDesc(time.hour))
    .replace(/{time_desc}/g, timeAtmos || formatTime(time))
    .replace(/{weather_desc}/g, weatherAtmos || weather.current)
    .replace(/{season_desc}/g, seasonAtmos)
    .replace(/{soundscape}/g, soundscape)
    .replace(/{smell}/g, smell)
    .replace(/{clock_hint}/g, clockHint)
    .replace(/{resource_status}/g, resourceStatus)
    .replace(/{turn}/g, String(turn));
}

function buildOptions(ctx: NarrativeContext): string[] {
  const { world, location, character } = ctx;
  const options: string[] = [];

  // Option 1: Urgent clock action
  const urgentClock = urgentClocks(world.clocks)[0];
  if (urgentClock) {
    options.push(`Address the "${urgentClock.name}" situation before it escalates`);
  } else {
    options.push('Scout the surroundings for intelligence');
  }

  // Option 2: Active quest
  const activeQuest = world.quests.active[0];
  if (activeQuest) {
    options.push(`Work on: ${activeQuest.title}`);
  } else {
    options.push('Investigate a lead you heard earlier');
  }

  // Option 3: Location-based action
  const region = world.regions.find((r) => r.id === location.regionId);
  const poi = region?.pointsOfInterest.find((p) => !p.explored);
  if (poi) {
    options.push(`Investigate ${poi.name}`);
  } else {
    const connectedRegion = world.regions.find(
      (r) => region?.connections.includes(r.id)
    );
    options.push(
      connectedRegion
        ? `Travel to ${connectedRegion.name}`
        : 'Move to a new location'
    );
  }

  // Option 4: Recovery or interaction
  const nearbyNPC = world.npcs.find(
    (n) => n.alive && n.lastSeenRegion === location.regionId && !n.isMinor
  );
  const lowHP = character.tracks.hp.current / character.tracks.hp.max < 0.6;
  if (lowHP) {
    options.push('Find a place to rest and recover');
  } else if (nearbyNPC) {
    options.push(`Approach ${nearbyNPC.name} — they may know something`);
  } else {
    options.push('Search for supplies or useful resources');
  }

  return options.slice(0, 4);
}

// ─── Template Adapter ─────────────────────────────────────────

export class TemplateNarrativeAdapter implements NarrativeAdapter {
  async generateSituation(ctx: NarrativeContext): Promise<NarrativeOutput> {
    const genre = mergedGenreProfile(ctx.config);
    const atmos = getAtmosphere(ctx.config.genre);

    // Turn 0 → use genre opening line for strong first impression
    let situation: string;
    if (ctx.turn === 0) {
      const opening = atmos.openingLines[ctx.config.secretDensity % atmos.openingLines.length];
      const template = pick(SITUATION_TEMPLATES, 0);
      const scene = fillTemplate(template, ctx, genre);
      situation = `${opening}\n\n${scene}`;
    } else {
      // Occasionally inject a danger cue or soundscape line for variety
      const template = pick(SITUATION_TEMPLATES, ctx.turn);
      const scene = fillTemplate(template, ctx, genre);
      const inject = ctx.turn % 4 === 0
        ? `\n\n${getDangerCue(ctx.config.genre, ctx.turn)}`
        : ctx.turn % 6 === 0
        ? ` The air carries ${getRandomSmell(ctx.config.genre, ctx.turn)}.`
        : '';
      situation = scene + inject;
    }

    // HP-critical warning line
    const hpPct = ctx.character.tracks.hp.current / ctx.character.tracks.hp.max;
    if (hpPct <= 0.25) {
      const warn = atmos.deathWarningLines[ctx.turn % atmos.deathWarningLines.length];
      situation = `${situation}\n\n⚠ ${warn}`;
    }

    const options = buildOptions(ctx);
    return { situation, options, mood: pickRandom(genre.toneWords) };
  }

  async generateConsequence(
    action: string,
    roll: RollResult | null,
    ctx: NarrativeContext
  ): Promise<string> {
    const atmos = getAtmosphere(ctx.config.genre);

    if (!roll) {
      return `${action} — the outcome plays out in the world around you.`;
    }

    let pool: string[];
    if (roll.isCrit) pool = [...CONSEQUENCE_CRIT, ...atmos.victoryLines];
    else if (roll.isFumble) pool = [...CONSEQUENCE_FUMBLE, ...atmos.failureLines];
    else if (roll.success) pool = [...CONSEQUENCE_SUCCESS, ...atmos.victoryLines];
    else pool = [...CONSEQUENCE_FAILURE, ...atmos.failureLines];

    const base = pick(pool, ctx.turn);
    return `${base}`;
  }
}

// ─── LLM Adapter (Stub) ───────────────────────────────────────

export class LLMNarrativeAdapter implements NarrativeAdapter {
  private apiKey: string;
  private model: string;
  private provider: 'anthropic' | 'openai';

  constructor(apiKey: string, model: string, provider: 'anthropic' | 'openai') {
    this.apiKey = apiKey;
    this.model = model;
    this.provider = provider;
  }

  async generateSituation(_ctx: NarrativeContext): Promise<NarrativeOutput> {
    throw new Error(
      'LLMNarrativeAdapter: not yet wired. Set up your API key and implement the prompt call.'
    );
  }

  async generateConsequence(
    _action: string,
    _roll: RollResult | null,
    _ctx: NarrativeContext
  ): Promise<string> {
    throw new Error('LLMNarrativeAdapter: not yet wired.');
  }
}

// ─── Factory ──────────────────────────────────────────────────

export function createNarrativeAdapter(
  type: 'template' | 'llm',
  opts?: { apiKey?: string; model?: string; provider?: 'anthropic' | 'openai' }
): NarrativeAdapter {
  if (type === 'llm') {
    if (!opts?.apiKey) throw new Error('LLM adapter requires an apiKey.');
    return new LLMNarrativeAdapter(
      opts.apiKey,
      opts.model ?? 'claude-sonnet-4-6',
      opts.provider ?? 'anthropic'
    );
  }
  return new TemplateNarrativeAdapter();
}
