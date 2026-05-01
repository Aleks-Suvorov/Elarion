import type {
  Clock,
  Economy,
  WorldTime,
  WorldState,
  Location,
  GameConfig,
  NPC,
  Season,
} from '../types';
import type { RNG } from '../lib/rng';

const WORLD_EVENTS: Record<string, string[]> = {
  fantasy: [
    'A merchant caravan is ambushed on the road nearby.',
    'Strange lights appear over the horizon — rumoured to be magical in origin.',
    'A bounty board posting appears for a known outlaw operating in the region.',
    'Refugees from a distant conflict arrive, speaking of terrible things.',
    'A minor earthquake shakes the region, destabilizing an old structure.',
  ],
  'sci-fi': [
    'A distress beacon activates from an unknown vessel.',
    'Local comms network reports a data breach at a corporate node.',
    'A ship of unknown registry enters the system without clearance.',
    'Power fluctuations hit the settlement grid — someone is drawing too much.',
    'A patrol goes missing in the restricted zone.',
  ],
  zombie: [
    'A horde shifts direction — scouts report it heading toward the settlement.',
    'A survivor staggers in with a bite wound. The group has hours to decide.',
    'Radio contact with another settlement goes dead mid-broadcast.',
    'A supply cache location is leaked. Multiple parties are moving to claim it.',
    'An unknown, faster strain of infected is spotted for the first time.',
  ],
  modern: [
    'A critical witness goes into hiding — someone tipped them off.',
    'A major deal between two factions falls through — tensions spike.',
    'An anonymous leak exposes a mid-level operation to the press.',
    'A vehicle pursuit ends badly in a public area.',
    'Surveillance footage surfaces that places the wrong person at the scene.',
  ],
  cyberpunk: [
    'A blackout hits the corporate district — someone pulled the plug.',
    'A netrunner collective issues a ransom demand against a megacorp.',
    'A street war flares between two gangs over distribution turf.',
    'A high-value data shard surfaces in an underground auction.',
    'An experimental augment hits the black market with dangerous side effects.',
  ],
  historical: [
    'A messenger arrives bearing sealed orders from a distant authority.',
    'Rumours of a plague in the next province reach the settlement.',
    'A noble family`s heir goes missing under suspicious circumstances.',
    'A trade agreement collapses, disrupting supply lines.',
    'An unusually harsh winter is forecast — food stores are checked.',
  ],
  mixed: [
    'An anomaly is reported in the region — unexplained and unsettling.',
    'Two rival groups clash near the settlement, threatening to spill over.',
    'A new opportunity emerges, but comes with obvious strings attached.',
    'A key resource becomes scarce unexpectedly.',
    'Someone from your past resurfaces — intentions unclear.',
  ],
};

const HOURS_PER_SEASON = 24 * 90;

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// ─── Clock System ─────────────────────────────────────────────

export function tickClocks(clocks: Clock[]): { clocks: Clock[]; completed: Clock[] } {
  const completed: Clock[] = [];
  const updated = clocks.map((clock) => {
    if (!clock.active || clock.ticks >= clock.maxTicks) return clock;
    const newTicks = clock.ticks + 1;
    const isDone = newTicks >= clock.maxTicks;
    if (isDone) completed.push({ ...clock, ticks: newTicks });
    return { ...clock, ticks: newTicks, active: !isDone };
  });
  return { clocks: updated, completed };
}

export function urgentClocks(clocks: Clock[]): Clock[] {
  return clocks
    .filter((c) => c.active && c.ticks < c.maxTicks)
    .sort((a, b) => (a.maxTicks - a.ticks) - (b.maxTicks - b.ticks));
}

// ─── Economy ──────────────────────────────────────────────────

export function tickEconomy(
  economy: Economy,
  _location: Location,
  _config: GameConfig,
  rng: RNG
): Economy {
  const nodes = economy.nodes.map((node) => {
    const supply: Record<string, number> = {};
    const demand: Record<string, number> = {};
    for (const [k, v] of Object.entries(node.supply)) {
      supply[k] = Math.max(0, v + rng.nextInt(-1, 1));
    }
    for (const [k, v] of Object.entries(node.demand)) {
      demand[k] = Math.max(0, v + rng.nextInt(-1, 1));
    }
    return { ...node, supply, demand };
  });
  return { ...economy, nodes };
}

// ─── Time ─────────────────────────────────────────────────────

export function advanceTime(time: WorldTime, hours: number): WorldTime {
  let { day, hour, season, year } = time;
  hour += hours;

  while (hour >= 24) {
    hour -= 24;
    day += 1;

    if (day > 90) {
      day = 1;
      const seasonIdx = SEASON_ORDER.indexOf(season);
      if (seasonIdx === 3) {
        season = 'spring';
        year += 1;
      } else {
        season = SEASON_ORDER[seasonIdx + 1];
      }
    }
  }

  return { day, hour, season, year };
}

export function formatTime(time: WorldTime): string {
  const hourStr = time.hour.toString().padStart(2, '0');
  return `Day ${time.day}, ${hourStr}:00 | ${time.season.charAt(0).toUpperCase() + time.season.slice(1)}, Year ${time.year}`;
}

// ─── Random Events ────────────────────────────────────────────

export function maybeGenerateEvent(
  config: GameConfig,
  _world: WorldState,
  rng: RNG,
  turn: number
): string | null {
  const chance = (config.randomEventFrequency / 10) * 0.2;
  if (rng.next() > chance) return null;

  const genre = config.genre;
  const table = WORLD_EVENTS[genre] ?? WORLD_EVENTS['mixed'];
  // Rotate through events based on turn to avoid repetition
  const idx = (turn + rng.nextInt(0, table.length - 1)) % table.length;
  return table[idx];
}

// ─── Consequence Application ──────────────────────────────────

export function applyWorldConsequence(world: WorldState, consequence: string): WorldState {
  const [tag, targetId] = consequence.split(':');
  const updated = { ...world };

  switch (tag) {
    case 'faction_hostile': {
      updated.factions = world.factions.map((f) =>
        f.id === targetId ? { ...f, attitude: Math.max(-100, f.attitude - 20) } : f
      );
      break;
    }
    case 'faction_friendly': {
      updated.factions = world.factions.map((f) =>
        f.id === targetId ? { ...f, attitude: Math.min(100, f.attitude + 15) } : f
      );
      break;
    }
    case 'region_danger_up': {
      updated.regions = world.regions.map((r) =>
        r.id === targetId ? { ...r, dangerLevel: Math.min(10, r.dangerLevel + 1) } : r
      );
      break;
    }
    case 'region_danger_down': {
      updated.regions = world.regions.map((r) =>
        r.id === targetId ? { ...r, dangerLevel: Math.max(1, r.dangerLevel - 1) } : r
      );
      break;
    }
    case 'region_explored': {
      updated.regions = world.regions.map((r) =>
        r.id === targetId ? { ...r, explored: true } : r
      );
      break;
    }
    case 'clock_tick': {
      updated.clocks = world.clocks.map((c) =>
        c.id === targetId ? { ...c, ticks: Math.min(c.maxTicks, c.ticks + 1) } : c
      );
      break;
    }
    case 'npc_death': {
      updated.npcs = world.npcs.map((n) =>
        n.id === targetId ? { ...n, alive: false } : n
      );
      break;
    }
    case 'npc_disposition_up': {
      updated.npcs = world.npcs.map((n) =>
        n.id === targetId ? { ...n, disposition: Math.min(100, n.disposition + 10) } : n
      );
      break;
    }
    case 'npc_disposition_down': {
      updated.npcs = world.npcs.map((n) =>
        n.id === targetId ? { ...n, disposition: Math.max(-100, n.disposition - 10) } : n
      );
      break;
    }
    case 'secret_discovered': {
      updated.secrets = world.secrets.map((s) =>
        s.id === targetId ? { ...s, discovered: true } : s
      );
      break;
    }
    default:
      break;
  }

  return updated;
}

// ─── NPC Dispositions ─────────────────────────────────────────

export function updateNPCDispositions(
  npcs: NPC[],
  actionTags: string[],
  _config: GameConfig
): NPC[] {
  return npcs.map((npc) => {
    let delta = 0;
    for (const tag of actionTags) {
      if (tag.includes(npc.factionId ?? '') && npc.factionId) {
        if (tag.includes('helped') || tag.includes('ally')) delta += 5;
        if (tag.includes('attacked') || tag.includes('hostile')) delta -= 5;
      }
    }
    if (delta === 0) return npc;
    return {
      ...npc,
      disposition: Math.max(-100, Math.min(100, npc.disposition + delta)),
    };
  });
}

// ─── NPC Promotion ────────────────────────────────────────────

export function promoteNPC(npc: NPC, config: GameConfig, rng: RNG): NPC {
  const backstory = `${npc.name} has proven themselves significant — their true motivations remain to be uncovered.`;
  const promoted: NPC = {
    ...npc,
    isMinor: false,
    backstory,
  };

  if (config.npcComplexity >= 3) {
    promoted.stats = {
      strength: rng.nextInt(3, 7),
      agility: rng.nextInt(3, 7),
      endurance: rng.nextInt(3, 7),
      perception: rng.nextInt(3, 7),
      intellect: rng.nextInt(3, 7),
      willpower: rng.nextInt(3, 7),
      charisma: rng.nextInt(3, 7),
      luck: rng.nextInt(3, 7),
    };
  }

  return promoted;
}
