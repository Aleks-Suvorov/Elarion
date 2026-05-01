// ============================================================
// USRE — Ultimate Sandbox RPG Engine
// Character Creation & Management
// ============================================================

import type {
  Stats,
  StatKey,
  Tracks,
  Track,
  Character,
  GameConfig,
  ArchetypeTemplate,
  SpeciesTemplate,
  Item,
  Genre,
  Trait,
} from '../types';

// ─── Species Templates ────────────────────────────────────────

export const SPECIES_TEMPLATES: SpeciesTemplate[] = [
  {
    id: 'human',
    name: 'Human',
    description:
      'Adaptable, resourceful, and driven. Humans excel in no single area but thrive in all.',
    statModifiers: { luck: 1 },
    traits: [
      {
        id: 'adaptable',
        name: 'Adaptable',
        description: 'Gain +1 to any one skill check per scene (choose before rolling).',
        tags: ['passive', 'universal'],
      },
    ],
    genres: ['fantasy', 'sci-fi', 'zombie', 'modern', 'cyberpunk', 'historical', 'mixed'],
  },
  {
    id: 'elf',
    name: 'Elf',
    description:
      'Graceful, long-lived, and perceptive. Elves are natural arcanists and scouts.',
    statModifiers: { agility: 1, perception: 1, endurance: -1 },
    traits: [
      {
        id: 'low_light_vision',
        name: 'Low-Light Vision',
        description: 'You can see clearly in dim light as if it were daylight.',
        tags: ['passive', 'exploration'],
      },
      {
        id: 'arcane_affinity',
        name: 'Arcane Affinity',
        description: '+1 to all Spellcraft checks.',
        tags: ['passive', 'magic'],
      },
    ],
    genres: ['fantasy', 'mixed'],
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description:
      'Stocky, resilient, and stubborn. Dwarves are masters of stone-craft and endurance.',
    statModifiers: { endurance: 2, strength: 1, agility: -1 },
    traits: [
      {
        id: 'stone_sense',
        name: 'Stone Sense',
        description: 'Never get lost underground; sense structural weaknesses in stone.',
        tags: ['passive', 'exploration'],
      },
      {
        id: 'poison_resistance',
        name: 'Poison Resistance',
        description: 'Advantage on saves against poison and disease.',
        tags: ['passive', 'defense'],
      },
    ],
    genres: ['fantasy', 'mixed'],
  },
  {
    id: 'orc',
    name: 'Orc',
    description:
      'Powerful and fierce. Orcs are warriors born, with unmatched physical might.',
    statModifiers: { strength: 2, endurance: 1, intellect: -1, charisma: -1 },
    traits: [
      {
        id: 'savage_fury',
        name: 'Savage Fury',
        description:
          'Once per combat, when reduced below 50% HP, deal +2 damage on your next attack.',
        tags: ['combat', 'passive'],
      },
    ],
    genres: ['fantasy', 'mixed'],
  },
  {
    id: 'android',
    name: 'Android',
    description:
      'Synthetic humanoid with enhanced processing and mechanical precision. No biological needs.',
    statModifiers: { intellect: 2, endurance: 1, charisma: -1 },
    traits: [
      {
        id: 'no_biological_needs',
        name: 'No Biological Needs',
        description: 'Immune to hunger, thirst, and disease survival penalties.',
        tags: ['passive', 'survival'],
      },
      {
        id: 'machine_logic',
        name: 'Machine Logic',
        description: '+1 to all Tech and Engineering checks.',
        tags: ['passive', 'tech'],
      },
    ],
    genres: ['sci-fi', 'cyberpunk', 'mixed'],
  },
  {
    id: 'alien',
    name: 'Alien (Generic)',
    description:
      'A non-human sapient from beyond known space. Physiology varies; adaptations abound.',
    statModifiers: { perception: 2, willpower: 1, charisma: -1 },
    traits: [
      {
        id: 'alien_senses',
        name: 'Alien Senses',
        description:
          'Detect electromagnetic fields and chemical signatures. +2 to tracking and searching.',
        tags: ['passive', 'exploration'],
      },
    ],
    genres: ['sci-fi', 'mixed'],
  },
  {
    id: 'mutant',
    name: 'Mutant',
    description:
      'A human altered by radiation or bio-plague. Unpredictable mutations grant power at a price.',
    statModifiers: { endurance: 1, strength: 1, charisma: -1 },
    traits: [
      {
        id: 'radiation_tolerance',
        name: 'Radiation Tolerance',
        description: 'Radiation track degrades 50% slower.',
        tags: ['passive', 'survival'],
      },
      {
        id: 'unstable_mutation',
        name: 'Unstable Mutation',
        description:
          'Once per session you may trigger a random mutation effect (GM or table roll).',
        tags: ['active', 'risk'],
      },
    ],
    genres: ['zombie', 'sci-fi', 'mixed'],
  },
  {
    id: 'enhanced_human',
    name: 'Enhanced Human',
    description:
      'A human elevated by cybernetic implants, bio-mods, or gene-therapy. The line between flesh and machine blurs.',
    statModifiers: { strength: 1, agility: 1, luck: -1 },
    traits: [
      {
        id: 'subdermal_plating',
        name: 'Subdermal Plating',
        description: 'Reduce incoming physical damage by 1 (minimum 1).',
        tags: ['passive', 'defense'],
      },
      {
        id: 'neural_link',
        name: 'Neural Link',
        description: '+1 to all Tech and Hacking checks.',
        tags: ['passive', 'tech'],
      },
    ],
    genres: ['cyberpunk', 'sci-fi', 'modern', 'mixed'],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description:
      'Small but extraordinarily lucky. Halflings slip through danger on instinct and charm.',
    statModifiers: { luck: 2, agility: 1, strength: -1 },
    traits: [
      {
        id: 'unnaturally_lucky',
        name: 'Unnaturally Lucky',
        description: 'Once per session, re-roll any one die and keep the new result.',
        tags: ['passive', 'luck'],
      },
    ],
    genres: ['fantasy', 'mixed'],
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description:
      'Of infernal descent. Tieflings carry dark heritage that both curses and empowers them.',
    statModifiers: { charisma: 1, willpower: 1, luck: -1 },
    traits: [
      {
        id: 'infernal_resistance',
        name: 'Infernal Resistance',
        description: 'Resistance to fire and necrotic damage.',
        tags: ['passive', 'defense', 'magic'],
      },
      {
        id: 'hellish_charm',
        name: 'Hellish Charm',
        description: '+1 to Intimidation and Deception rolls.',
        tags: ['passive', 'social'],
      },
    ],
    genres: ['fantasy', 'mixed'],
  },
];

// ─── Stat Helpers ─────────────────────────────────────────────

const ALL_STAT_KEYS: StatKey[] = [
  'strength',
  'agility',
  'endurance',
  'perception',
  'intellect',
  'willpower',
  'charisma',
  'luck',
];

export function defaultStats(): Stats {
  return {
    strength: 5,
    agility: 5,
    endurance: 5,
    perception: 5,
    intellect: 5,
    willpower: 5,
    charisma: 5,
    luck: 5,
  };
}

/**
 * Build Stats from a point-buy allocation.
 * All stats start at `base` (default 3); the player spends points on top.
 * Values are clamped between 1 and 10.
 */
export function buildStats(
  allocations: Partial<Stats>,
  base: number = 3
): Stats {
  const stats: Stats = {
    strength: base,
    agility: base,
    endurance: base,
    perception: base,
    intellect: base,
    willpower: base,
    charisma: base,
    luck: base,
  };

  for (const key of ALL_STAT_KEYS) {
    const add = allocations[key] ?? 0;
    stats[key] = Math.min(10, Math.max(1, base + add));
  }

  // Optional extended stats
  if (allocations.tech !== undefined) {
    stats.tech = Math.min(10, Math.max(1, base + allocations.tech));
  }
  if (allocations.magic !== undefined) {
    stats.magic = Math.min(10, Math.max(1, base + allocations.magic));
  }
  if (allocations.psionics !== undefined) {
    stats.psionics = Math.min(10, Math.max(1, base + allocations.psionics));
  }

  return stats;
}

// ─── Track Computation ────────────────────────────────────────

export function computeMaxHP(stats: Stats, level: number): number {
  return stats.endurance * 3 + level * 2 + 10;
}

export function computeMaxStamina(stats: Stats): number {
  return stats.endurance * 2 + stats.willpower + 5;
}

export function computeMaxMana(stats: Stats, magicLevel: number): number {
  if (magicLevel === 0) return 0;
  const magicStat = stats.magic ?? 0;
  if (magicStat === 0) return 0;
  return magicStat * 3 + stats.intellect + 5;
}

export function computeMaxPsi(stats: Stats, psiLevel: number): number {
  if (psiLevel === 0) return 0;
  const psiStat = stats.psionics ?? 0;
  if (psiStat === 0) return 0;
  return psiStat * 3 + stats.willpower + 5;
}

function makeTrack(current: number, max: number, label: string, color?: string): Track {
  return { current, max, label, color };
}

export function buildTracks(
  stats: Stats,
  config: GameConfig,
  level: number
): Tracks {
  const maxHp = computeMaxHP(stats, level);
  const maxStamina = computeMaxStamina(stats);
  const maxMana = computeMaxMana(stats, config.magicLevel);
  const maxPsi = computeMaxPsi(stats, config.supernaturalLevel);

  const tracks: Tracks = {
    hp: makeTrack(maxHp, maxHp, 'HP', '#e74c3c'),
    stamina: makeTrack(maxStamina, maxStamina, 'Stamina', '#f39c12'),
  };

  if (maxMana > 0) {
    tracks.mana = makeTrack(maxMana, maxMana, 'Mana', '#9b59b6');
  }
  if (maxPsi > 0) {
    tracks.psi = makeTrack(maxPsi, maxPsi, 'Psi', '#1abc9c');
  }

  // Survival meters
  if (config.survivalEnabled) {
    const meters = config.survivalMeters;
    if (meters.includes('hunger')) {
      tracks.hunger = makeTrack(100, 100, 'Hunger', '#e67e22');
    }
    if (meters.includes('thirst')) {
      tracks.thirst = makeTrack(100, 100, 'Thirst', '#3498db');
    }
    if (meters.includes('temperature')) {
      tracks.temperature = makeTrack(50, 100, 'Temperature', '#e74c3c');
    }
    if (meters.includes('fatigue')) {
      tracks.fatigue = makeTrack(100, 100, 'Fatigue', '#95a5a6');
    }
    if (meters.includes('radiation')) {
      tracks.radiation = makeTrack(100, 100, 'Radiation', '#27ae60');
    }
    if (meters.includes('disease')) {
      tracks.disease = makeTrack(100, 100, 'Disease', '#8e44ad');
    }
  }

  return tracks;
}

// ─── XP Table ────────────────────────────────────────────────

export function xpToNextLevel(level: number): number {
  return level * 100 + level * level * 10;
}

// ─── Species Modifiers ────────────────────────────────────────

export function applySpeciesModifiers(
  stats: Stats,
  species: SpeciesTemplate
): Stats {
  const result = { ...stats };
  const mods = species.statModifiers;

  for (const key of Object.keys(mods) as StatKey[]) {
    const mod = mods[key];
    if (mod === undefined) continue;
    const current = result[key] ?? 5;
    result[key] = Math.min(10, Math.max(1, current + mod));
  }

  return result;
}

// ─── Build Full Character ─────────────────────────────────────

export function buildCharacter(params: {
  name: string;
  archetype: ArchetypeTemplate;
  species: SpeciesTemplate;
  stats: Stats;
  config: GameConfig;
  level: number;
}): Character {
  const { name, archetype, species, config, level } = params;

  // Apply species stat bonuses
  const stats = applySpeciesModifiers(params.stats, species);
  const tracks = buildTracks(stats, config, level);

  // Merge traits from archetype + species (avoiding duplicate ids)
  const seenTraitIds = new Set<string>();
  const traits: Trait[] = [];
  for (const t of [...archetype.startingTraits, ...species.traits]) {
    if (!seenTraitIds.has(t.id)) {
      seenTraitIds.add(t.id);
      traits.push(t);
    }
  }

  // Genre-appropriate starting items
  const startingItems = buildStartingItems(config.genre);

  return {
    name,
    archetype: archetype.name,
    species: species.name,
    level,
    xp: 0,
    xpToNext: xpToNextLevel(level),
    stats,
    tracks,
    skills: { ...archetype.startingSkills },
    abilities: [...archetype.startingAbilities],
    traits,
    inventory: startingItems,
    equipment: {},
    reputation: {},
    connections: [],
    backstory: '',
    appearance: '',
    notes: '',
  };
}

function buildStartingItems(genre: Genre): Item[] {
  const base: Item = {
    id: 'ration-1',
    name: 'Rations',
    description: 'A day\'s worth of travel rations.',
    quantity: 3,
    weight: 1,
    value: 2,
    tags: ['food', 'consumable'],
  };

  const genreItems: Record<string, Item[]> = {
    fantasy: [
      base,
      {
        id: 'torch-1',
        name: 'Torch',
        description: 'Burns for 1 hour, illuminates a 10m radius.',
        quantity: 3,
        weight: 0.5,
        value: 1,
        tags: ['tool', 'light'],
      },
      {
        id: 'coin-pouch',
        name: 'Coin Pouch',
        description: '15 gold pieces.',
        quantity: 1,
        weight: 0.2,
        value: 15,
        tags: ['currency'],
      },
    ],
    'sci-fi': [
      {
        id: 'ration-sf',
        name: 'Nutrient Pack',
        description: 'Compressed caloric block. 3 servings.',
        quantity: 3,
        weight: 0.3,
        value: 5,
        tags: ['food', 'consumable'],
      },
      {
        id: 'medipen-1',
        name: 'Medipen',
        description: 'Restores 1d10+2 HP when injected. Single use.',
        quantity: 2,
        weight: 0.1,
        value: 30,
        tags: ['medical', 'consumable'],
      },
      {
        id: 'credits',
        name: 'Credit Chip',
        description: '50 standard credits.',
        quantity: 1,
        weight: 0,
        value: 50,
        tags: ['currency'],
      },
    ],
    zombie: [
      {
        id: 'canned-food',
        name: 'Canned Food',
        description: 'Non-perishable food items. 5 servings.',
        quantity: 5,
        weight: 2,
        value: 10,
        tags: ['food', 'consumable'],
      },
      {
        id: 'water-bottle',
        name: 'Water Bottle',
        description: 'Full 1-litre water bottle.',
        quantity: 2,
        weight: 1,
        value: 5,
        tags: ['water', 'consumable'],
      },
      {
        id: 'bandages',
        name: 'Bandages',
        description: 'Stops bleeding. Restores 3 HP. 4 uses.',
        quantity: 4,
        weight: 0.2,
        value: 3,
        tags: ['medical', 'consumable'],
      },
    ],
    cyberpunk: [
      {
        id: 'stims',
        name: 'Stim Pack',
        description: '+1 Agility for 1 scene. Crash after.',
        quantity: 2,
        weight: 0.05,
        value: 40,
        tags: ['drug', 'consumable'],
      },
      {
        id: 'eddies',
        name: 'Eddies (Cash)',
        description: '200 eurodollars.',
        quantity: 1,
        weight: 0,
        value: 200,
        tags: ['currency'],
      },
    ],
    modern: [
      {
        id: 'cash',
        name: 'Cash',
        description: '$300 in mixed bills.',
        quantity: 1,
        weight: 0,
        value: 300,
        tags: ['currency'],
      },
      {
        id: 'phone',
        name: 'Smartphone',
        description: 'Fully charged. Has maps, contacts.',
        quantity: 1,
        weight: 0.2,
        value: 500,
        tags: ['tool', 'tech'],
      },
    ],
    historical: [
      base,
      {
        id: 'silver-coins',
        name: 'Silver Coins',
        description: '10 silver pieces.',
        quantity: 1,
        weight: 0.1,
        value: 10,
        tags: ['currency'],
      },
    ],
    mixed: [base],
  };

  return genreItems[genre] ?? [base];
}

// ─── Inventory Management ─────────────────────────────────────

export function addItem(character: Character, item: Item): Character {
  const inv = [...character.inventory];
  const stackable = item.tags.includes('stackable') || item.tags.includes('consumable') || item.tags.includes('currency') || item.tags.includes('food') || item.tags.includes('water') || item.tags.includes('ammo');

  if (stackable) {
    const existing = inv.findIndex((i) => i.id === item.id);
    if (existing >= 0) {
      inv[existing] = { ...inv[existing], quantity: inv[existing].quantity + item.quantity };
      return { ...character, inventory: inv };
    }
  }

  return { ...character, inventory: [...inv, { ...item }] };
}

export function removeItem(
  character: Character,
  itemId: string,
  qty: number = 1
): Character {
  const inv = character.inventory
    .map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, quantity: i.quantity - qty };
    })
    .filter((i) => i.quantity > 0);

  return { ...character, inventory: inv };
}

// ─── HP / Stamina ─────────────────────────────────────────────

export function applyHPDelta(character: Character, delta: number): Character {
  const hp = character.tracks.hp;
  const next = Math.min(hp.max, Math.max(0, hp.current + delta));
  return {
    ...character,
    tracks: {
      ...character.tracks,
      hp: { ...hp, current: next },
    },
  };
}

export function applyStaminaDelta(
  character: Character,
  delta: number
): Character {
  const st = character.tracks.stamina;
  const next = Math.min(st.max, Math.max(0, st.current + delta));
  return {
    ...character,
    tracks: {
      ...character.tracks,
      stamina: { ...st, current: next },
    },
  };
}

export function isDown(character: Character): boolean {
  return character.tracks.hp.current <= 0;
}

// ─── Character Summary ────────────────────────────────────────

export function characterSummary(char: Character): string {
  const hp = char.tracks.hp;
  const hpStr = `HP ${hp.current}/${hp.max}`;
  const st = char.tracks.stamina;
  const stStr = `Stamina ${st.current}/${st.max}`;
  const topStats = `STR ${char.stats.strength} AGI ${char.stats.agility} END ${char.stats.endurance} INT ${char.stats.intellect}`;

  const lines = [
    `${char.name} — ${char.species} ${char.archetype} (Lv ${char.level})`,
    `${hpStr} | ${stStr}`,
    topStats,
  ];

  if (char.tracks.mana) {
    lines.push(`Mana ${char.tracks.mana.current}/${char.tracks.mana.max}`);
  }
  if (char.tracks.psi) {
    lines.push(`Psi ${char.tracks.psi.current}/${char.tracks.psi.max}`);
  }

  const abilityNames = char.abilities.map((a) => a.name).join(', ');
  if (abilityNames) lines.push(`Abilities: ${abilityNames}`);

  return lines.join('\n');
}
