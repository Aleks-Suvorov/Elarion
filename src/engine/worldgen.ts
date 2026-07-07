import type {
  WorldState,
  WorldGenInput,
  Region,
  Faction,
  NPC,
  Clock,
  Economy,
  WorldTime,
  Weather,
  Secret,
  Quest,
  QuestObjective,
  WorldBible,
  GameConfig,
  PointOfInterest,
  FactionRelation,
  EconomyNode,
} from '../types';
import { createRNG, type RNG } from '../lib/rng';
import { GENRE_PROFILES, mergedGenreProfile } from '../data/genres';

// ─── Name Tables ──────────────────────────────────────────────

const ADJECTIVES = [
  'Iron', 'Ash', 'Stone', 'Dark', 'Scarred', 'Ancient', 'Hollow', 'Rust',
  'Broken', 'Silent', 'Lost', 'Crimson', 'Grey', 'Pale', 'Bitter', 'Frozen',
  'Sunken', 'Burning', 'Salt', 'Bone', 'Mist', 'Thunder', 'Black', 'Silver',
];

const FIRST_NAMES = [
  'Arden', 'Mira', 'Cael', 'Vex', 'Soren', 'Lysa', 'Dravan', 'Nia',
  'Theron', 'Zara', 'Keiran', 'Rynn', 'Aldric', 'Syla', 'Bren', 'Faye',
  'Orin', 'Della', 'Cass', 'Rem', 'Petra', 'Galen', 'Wren', 'Cole',
  'Axel', 'Nova', 'Jin', 'Silas', 'Vera', 'Dax', 'Lira', 'Harlan',
];

const LAST_NAMES = [
  'Voss', 'Crane', 'Ashford', 'Mercer', 'Drale', 'Sable', 'Wren', 'Kane',
  'Frost', 'Thorn', 'Cross', 'Drake', 'Vale', 'Rook', 'Steele', 'Marsh',
  'Quinn', 'Hollow', 'Crest', 'Stone', 'Gale', 'Holt', 'Trace', 'Vane',
];

const FACTION_SUFFIXES = [
  'Syndicate', 'Coalition', 'Order', 'Brotherhood', 'Alliance', 'Accord',
  'Collective', 'Assembly', 'League', 'Conclave', 'Council', 'Compact',
];

const ROLES = [
  'leader', 'enforcer', 'spy', 'healer', 'trader', 'guard', 'scholar',
  'hunter', 'engineer', 'negotiator', 'commander', 'scout', 'advisor',
];

// Consequence tag templates — format: 'tag:targetId' (parsed by applyWorldConsequence)
// The %FACTION% and %REGION% placeholders are replaced with real IDs at clock generation time.
const THREAT_CONSEQUENCES = ['faction_hostile:%FACTION%', 'region_danger_up:%REGION%'];
const OPPORTUNITY_CONSEQUENCES = ['faction_friendly:%FACTION%', 'region_danger_down:%REGION%'];
const EVENT_CONSEQUENCES = ['region_danger_up:%REGION%', 'faction_hostile:%FACTION%'];

// ─── ID Generator ─────────────────────────────────────────────

function uid(type: string, index: number): string {
  return `${type}-${index}`;
}

// ─── Name Generators ──────────────────────────────────────────

function genRegionName(rng: RNG, locationType: string): string {
  const adj = rng.pick(ADJECTIVES);
  const base = locationType.split(' ').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  return `${adj} ${base}`;
}

function genFactionName(rng: RNG, archetype: string): string {
  const adj = rng.pick(ADJECTIVES);
  const suffix = rng.pick(FACTION_SUFFIXES);
  return `${adj} ${suffix}`;
}

function genNPCName(rng: RNG): string {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
}

// ─── POI Generator ────────────────────────────────────────────

function genPOIs(rng: RNG, count: number, genre: string): PointOfInterest[] {
  const templates = [
    'abandoned structure', 'hidden cache', 'ruined outpost', 'contested waypoint',
    'ancient marker', 'dangerous crossing', 'fortified position', 'hidden passage',
    'resource deposit', 'shelter site', 'neutral meeting ground', 'forgotten shrine',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: uid('poi', i),
    name: genRegionName(rng, rng.pick(templates)),
    description: 'An area of interest worth investigating.',
    explored: false,
    tags: [],
  }));
}

// ─── Region Generator ─────────────────────────────────────────

function genRegions(rng: RNG, config: GameConfig): Region[] {
  const profile = mergedGenreProfile(config);
  const count = config.majorRegionsCount;
  const regions: Region[] = [];

  for (let i = 0; i < count; i++) {
    const locType = rng.pick(profile.locationTypes);
    const terrain = rng.pick(profile.terrains);
    const resources = Array.from({ length: rng.nextInt(2, 4) }, () =>
      rng.pick(profile.resources)
    );

    regions.push({
      id: uid('region', i),
      name: genRegionName(rng, locType),
      description: `A ${terrain} ${locType}. ${rng.pick(profile.toneWords)} and strategically significant.`,
      climate: terrain,
      dangerLevel: rng.nextInt(1, 8),
      factionControl: {},
      resources: [...new Set(resources)],
      pointsOfInterest: genPOIs(rng, rng.nextInt(1, 3), config.genre),
      connections: [],
      explored: i === 0,
      hexCoords: config.hexExploration
        ? { q: Math.floor(i / 3) * 2 - (i % 3), r: i % 3 }
        : undefined,
      tags: [terrain, locType],
    });
  }

  // Connect regions in a ring + random extra edges
  for (let i = 0; i < regions.length; i++) {
    const next = (i + 1) % regions.length;
    if (!regions[i].connections.includes(regions[next].id)) {
      regions[i].connections.push(regions[next].id);
      regions[next].connections.push(regions[i].id);
    }
    // Extra connections
    if (regions.length > 3 && rng.next() < 0.35) {
      const target = rng.nextInt(0, regions.length - 1);
      if (target !== i && !regions[i].connections.includes(regions[target].id)) {
        regions[i].connections.push(regions[target].id);
        regions[target].connections.push(regions[i].id);
      }
    }
  }

  return regions;
}

// ─── Faction Generator ────────────────────────────────────────

function genFactions(rng: RNG, config: GameConfig, regions: Region[]): Faction[] {
  const profile = mergedGenreProfile(config);
  const count = config.majorFactionsCount;
  const factions: Faction[] = [];

  for (let i = 0; i < count; i++) {
    const archetype = rng.pick(profile.factionArchetypes);
    const territory: string[] = [];
    // Assign 1–2 regions
    const numTerritory = Math.min(regions.length, rng.nextInt(1, 2));
    const shuffled = [...regions].sort(() => rng.next() - 0.5);
    for (let j = 0; j < numTerritory; j++) {
      territory.push(shuffled[j].id);
      shuffled[j].factionControl[uid('faction', i)] = rng.nextInt(40, 80);
    }

    factions.push({
      id: uid('faction', i),
      name: genFactionName(rng, archetype),
      description: `A ${archetype} with significant influence in the region.`,
      attitude: rng.nextInt(-20, 50),
      power: rng.nextInt(2, 9),
      goals: [rng.pick(profile.questHooks), rng.pick(profile.questHooks)],
      resources: [rng.pick(profile.resources), rng.pick(profile.resources)],
      memberIds: [],
      territory,
      relations: [],
      tags: [archetype],
    });
  }

  // Generate inter-faction relations
  for (let i = 0; i < factions.length; i++) {
    for (let j = i + 1; j < factions.length; j++) {
      const attitude = rng.nextInt(-50, 50);
      const relA: FactionRelation = {
        factionId: factions[j].id,
        attitude,
        notes: attitude > 0 ? 'Uneasy alliance' : 'Active rivalry',
      };
      const relB: FactionRelation = {
        factionId: factions[i].id,
        attitude: attitude + rng.nextInt(-10, 10),
        notes: relA.notes,
      };
      factions[i].relations.push(relA);
      factions[j].relations.push(relB);
    }
  }

  return factions;
}

// ─── NPC Generator ────────────────────────────────────────────

function genNPCs(rng: RNG, config: GameConfig, factions: Faction[], regions: Region[]): NPC[] {
  const profile = mergedGenreProfile(config);
  const npcs: NPC[] = [];
  let npcIndex = 0;

  // Faction members
  for (const faction of factions) {
    const memberCount = Math.min(3, rng.nextInt(2, 4));
    for (let j = 0; j < memberCount; j++) {
      const isLeader = j === 0;
      const npcId = uid('npc', npcIndex++);
      const regionId = faction.territory[0] ?? regions[0].id;
      npcs.push({
        id: npcId,
        name: genNPCName(rng),
        species: rng.pick(profile.entityArchetypes),
        role: isLeader ? 'leader' : rng.pick(ROLES),
        factionId: faction.id,
        disposition: rng.nextInt(10, 60),
        notes: `${isLeader ? 'Leader' : 'Member'} of the ${faction.name}.`,
        isMinor: !isLeader,
        lastSeenRegion: regionId,
        alive: true,
        tags: [isLeader ? 'leader' : 'member', faction.tags[0] ?? ''],
      });
      faction.memberIds.push(npcId);
    }
  }

  // Free agents
  for (let i = 0; i < 2; i++) {
    const regionId = rng.pick(regions).id;
    npcs.push({
      id: uid('npc', npcIndex++),
      name: genNPCName(rng),
      species: rng.pick(profile.entityArchetypes),
      role: rng.pick(ROLES),
      factionId: null,
      disposition: rng.nextInt(-10, 50),
      notes: 'An independent actor with their own agenda.',
      isMinor: true,
      lastSeenRegion: regionId,
      alive: true,
      tags: ['independent'],
    });
  }

  return npcs;
}

// ─── Clock Generator ──────────────────────────────────────────

function genClocks(rng: RNG, config: GameConfig, factions: Faction[], regions: Region[]): Clock[] {
  const clockCount = rng.nextInt(2, 4);
  const clocks: Clock[] = [];
  const categories: Clock['category'][] = ['threat', 'threat', 'event', 'opportunity'];

  for (let i = 0; i < clockCount; i++) {
    const category = categories[i % categories.length];
    const faction = factions.length > 0 ? rng.pick(factions) : null;
    const region = rng.pick(regions);
    const factionId = faction?.id ?? uid('faction', 0);
    const pool =
      category === 'threat' ? THREAT_CONSEQUENCES :
      category === 'opportunity' ? OPPORTUNITY_CONSEQUENCES :
      EVENT_CONSEQUENCES;
    const onComplete = rng.pick(pool)
      .replace('%FACTION%', factionId)
      .replace('%REGION%', region.id);

    clocks.push({
      id: uid('clock', i),
      name: category === 'threat'
        ? `${faction?.name ?? 'Hostile Forces'} Advances`
        : category === 'opportunity'
        ? 'Window of Opportunity'
        : 'Unfolding Event',
      description: category === 'threat'
        ? `${faction?.name ?? 'Unknown forces'} are consolidating power. If unchecked, they will dominate ${region.name}.`
        : `An event is building that could shift the balance in ${region.name}.`,
      ticks: 0,
      maxTicks: rng.nextInt(4, 8),
      category,
      onComplete,
      active: true,
      regionId: region.id,
      factionId: faction?.id,
    });
  }

  return clocks;
}

// ─── Economy Generator ────────────────────────────────────────

function genEconomy(rng: RNG, regions: Region[], config: GameConfig): Economy {
  const nodes: EconomyNode[] = regions.map((region) => {
    const supply: Record<string, number> = {};
    const demand: Record<string, number> = {};
    for (const resource of region.resources) {
      supply[resource] = rng.nextInt(5, 20);
      demand[resource] = rng.nextInt(2, 10);
    }
    return {
      regionId: region.id,
      supply,
      demand,
      priceModifiers: {},
    };
  });

  return {
    nodes,
    globalModifiers: {},
    tradeRoutes: [],
  };
}

// ─── Secret Generator ─────────────────────────────────────────

function genSecrets(rng: RNG, config: GameConfig, regions: Region[], factions: Faction[]): Secret[] {
  const count = Math.floor(config.secretDensity / 3) + 1;
  const templates = [
    'An ancient vault lies beneath {region}, sealed for centuries.',
    'The {faction} has been secretly manipulating the economy.',
    'A hidden passage connects {region} to distant territories.',
    'The true cause of the regional instability is being concealed by {faction}.',
    'A dangerous entity is dormant in {region}, awaiting the right conditions to emerge.',
    'Someone in {faction} is feeding information to an outside power.',
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = rng.pick(templates);
    const region = rng.pick(regions);
    const faction = factions.length > 0 ? rng.pick(factions) : null;
    return {
      id: uid('secret', i),
      description: template
        .replace('{region}', region.name)
        .replace('{faction}', faction?.name ?? 'unknown parties'),
      discovered: false,
      relatedIds: [region.id, ...(faction ? [faction.id] : [])],
      hint: 'Something does not add up here.',
    };
  });
}

// ─── Quest Generator ──────────────────────────────────────────

export function generateQuestSeeds(world: WorldState, rng: RNG, count: number): Quest[] {
  const profile = GENRE_PROFILES[world.regions[0]?.tags[0] as keyof typeof GENRE_PROFILES] ??
    Object.values(GENRE_PROFILES)[0];
  const quests: Quest[] = [];

  for (let i = 0; i < count; i++) {
    const hook = rng.pick(profile.questHooks);
    const region = world.regions.length > 0 ? rng.pick(world.regions) : null;
    const npc = world.npcs.length > 0 ? rng.pick(world.npcs.filter((n) => !n.isMinor)) : null;

    const objectives: QuestObjective[] = [
      {
        id: uid('obj', i * 10),
        description: hook,
        completed: false,
        optional: false,
      },
    ];

    quests.push({
      id: uid('quest', i),
      title: hook.split(' ').slice(0, 5).join(' '),
      description: `${hook}. The stakes are high and time may be short.`,
      objectives,
      rewards: ['Experience', 'Faction reputation', 'Useful items'],
      giverId: npc?.id ?? null,
      regionId: region?.id ?? null,
      turnStarted: 0,
      tags: ['main', 'generated'],
    });
  }

  return quests;
}

// ─── Main World Generator ─────────────────────────────────────

export function generateWorld(input: WorldGenInput): WorldState {
  const rng = createRNG(input.seed);
  const { config } = input;

  const regions = genRegions(rng, config);
  const factions = genFactions(rng, config, regions);
  const npcs = genNPCs(rng, config, factions, regions);
  const clocks = genClocks(rng, config, factions, regions);
  const economy = genEconomy(rng, regions, config);
  const secrets = genSecrets(rng, config, regions, factions);

  const time: WorldTime = { day: 1, hour: 8, season: 'spring', year: 1 };
  const weather: Weather = {
    current: rng.pick(['clear', 'overcast', 'rain', 'fog', 'wind']),
    severity: rng.nextInt(0, 2),
    duration: rng.nextInt(1, 5),
  };

  const stub: WorldState = {
    regions,
    factions,
    npcs,
    clocks,
    quests: { active: [], completed: [], failed: [] },
    economy,
    time,
    weather,
    secrets,
    flags: {},
  };

  const questSeeds = generateQuestSeeds(stub, rng, 2);
  stub.quests.active = questSeeds;

  return stub;
}

// ─── World Bible ──────────────────────────────────────────────

export function generateWorldBible(world: WorldState, config: GameConfig): WorldBible {
  return {
    regions_compact: world.regions.map((r) => ({
      id: r.id,
      name: r.name,
      summary: `${r.climate} | Danger ${r.dangerLevel}/10 | ${r.resources.join(', ')}`,
    })),
    species_compact: [],
    factions_compact: world.factions.map((f) => ({
      id: f.id,
      name: f.name,
      summary: `Power ${f.power}/10 | Attitude ${f.attitude} | Territory: ${f.territory.length} regions`,
    })),
    economy_compact: `${config.economyIntensity === 1 ? 'Loose' : config.economyIntensity === 2 ? 'Structured' : 'Full sim'} economy with ${world.regions.length} trade nodes.`,
    key_npcs_compact: world.npcs
      .filter((n) => !n.isMinor)
      .map((n) => ({
        id: n.id,
        name: n.name,
        summary: `${n.role} | ${n.factionId ?? 'independent'} | Disp: ${n.disposition}`,
      })),
    quest_seeds: world.quests.active.map((q) => q.title),
    global_clocks: world.clocks.filter((c) => c.active),
    known_secrets_compact: `${world.secrets.length} secrets seeded. None yet discovered.`,
  };
}
