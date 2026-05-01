import type { ArchetypeTemplate, Genre } from '../types';

// ─── Universal Archetype Templates ───────────────────────────
// Each archetype can be adapted to any genre.
// The tagline matching uses fuzzy keyword scoring.

export const ARCHETYPE_TEMPLATES: ArchetypeTemplate[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    taglines: ['fighter', 'warrior', 'soldier', 'merc', 'mercenary', 'guard', 'knight', 'enforcer', 'legionnaire'],
    description: 'A combat-hardened fighter who relies on strength, endurance, and tactical knowledge.',
    primaryStats: ['strength', 'endurance'],
    startingSkills: { 'Melee Combat': 2, 'Endurance': 1, 'Intimidation': 1 },
    startingAbilities: [
      {
        id: 'cleave',
        name: 'Cleave',
        description: 'On a critical hit with a melee weapon, attack an adjacent enemy for half damage.',
        tags: ['combat', 'melee'],
      },
      {
        id: 'iron_constitution',
        name: 'Iron Constitution',
        description: 'Reduce incoming physical damage by 1 (minimum 1).',
        tags: ['passive', 'defense'],
      },
    ],
    startingTraits: [
      {
        id: 'battle_hardened',
        name: 'Battle-Hardened',
        description: 'You have seen enough violence that first strikes no longer surprise you.',
        modifier: { endurance: 1 },
      },
    ],
    genres: ['fantasy', 'historical', 'mixed', 'zombie', 'modern', 'sci-fi', 'cyberpunk'],
  },

  {
    id: 'rogue',
    name: 'Rogue',
    taglines: ['rogue', 'thief', 'assassin', 'spy', 'infiltrator', 'scout', 'shadow', 'operative', 'blade', 'hitman', 'sneak'],
    description: 'A quick, deceptive operative who excels at stealth, misdirection, and precise strikes.',
    primaryStats: ['agility', 'perception'],
    startingSkills: { 'Stealth': 2, 'Deception': 1, 'Lockpicking': 1 },
    startingAbilities: [
      {
        id: 'backstab',
        name: 'Backstab',
        description: 'When attacking from stealth or with advantage, deal +3 bonus damage.',
        tags: ['combat', 'stealth'],
      },
      {
        id: 'shadow_step',
        name: 'Shadow Step',
        description: 'Once per scene, move silently without triggering a Stealth check.',
        uses: 1,
        tags: ['stealth', 'movement'],
      },
    ],
    startingTraits: [
      {
        id: 'light_fingers',
        name: 'Light Fingers',
        description: 'You can attempt sleight of hand without requiring a tool.',
        modifier: { agility: 1 },
      },
    ],
    genres: ['fantasy', 'modern', 'cyberpunk', 'historical', 'mixed', 'sci-fi'],
  },

  {
    id: 'mage',
    name: 'Mage / Arcanist',
    taglines: ['mage', 'wizard', 'sorcerer', 'witch', 'warlock', 'arcanist', 'caster', 'scholar'],
    description: 'A wielder of arcane or mystical forces — devastating at range but physically fragile.',
    primaryStats: ['magic', 'intellect'],
    startingSkills: { 'Arcane Knowledge': 2, 'Spellcraft': 2, 'History': 1 },
    startingAbilities: [
      {
        id: 'arcane_bolt',
        name: 'Arcane Bolt',
        description: 'Hurl a bolt of raw magical energy. Ranged attack, DC 6 Agility to dodge.',
        cost: '2 Mana',
        tags: ['magic', 'combat', 'ranged'],
      },
      {
        id: 'arcane_ward',
        name: 'Arcane Ward',
        description: 'Create a shield of force. Reduce damage from the next attack by 3.',
        cost: '1 Mana',
        uses: 3,
        tags: ['magic', 'defense'],
      },
    ],
    startingTraits: [
      {
        id: 'mana_sensitive',
        name: 'Mana Sensitive',
        description: 'You sense magical auras within 30m without rolling.',
        modifier: { magic: 1 },
      },
    ],
    genres: ['fantasy', 'mixed'],
  },

  {
    id: 'medic',
    name: 'Medic / Healer',
    taglines: ['medic', 'healer', 'doctor', 'surgeon', 'field medic', 'combat medic', 'nurse', 'physician'],
    description: 'A life-saver who keeps companions alive and diagnoses hidden threats.',
    primaryStats: ['intellect', 'perception'],
    startingSkills: { 'Medicine': 3, 'Perception': 1, 'Calm Under Pressure': 1 },
    startingAbilities: [
      {
        id: 'field_dressing',
        name: 'Field Dressing',
        description: 'Spend 1 action to restore 1d10+2 HP to a target. Requires supplies.',
        uses: 'unlimited',
        tags: ['healing', 'support'],
      },
      {
        id: 'triage',
        name: 'Triage',
        description: 'Stabilize any downed character as a free action once per turn.',
        tags: ['healing', 'passive'],
      },
    ],
    startingTraits: [
      {
        id: 'steady_hands',
        name: 'Steady Hands',
        description: 'You do not suffer disadvantage from stress when performing medical procedures.',
        modifier: { intellect: 1 },
      },
    ],
    genres: ['fantasy', 'sci-fi', 'zombie', 'modern', 'historical', 'cyberpunk', 'mixed'],
  },

  {
    id: 'engineer',
    name: 'Engineer / Technician',
    taglines: ['engineer', 'tech', 'hacker', 'mechanic', 'tinker', 'decker', 'netrunner', 'inventor', 'fabricator'],
    description: 'A technical expert who builds, breaks, and reprograms the world around them.',
    primaryStats: ['tech', 'intellect'],
    startingSkills: { 'Engineering': 2, 'Electronics': 2, 'Hacking': 1 },
    startingAbilities: [
      {
        id: 'jury_rig',
        name: 'Jury-Rig',
        description: 'Improvise a functional device from available parts in 1 turn. Lasts 1 scene.',
        uses: 3,
        tags: ['tech', 'crafting'],
      },
      {
        id: 'override',
        name: 'Override',
        description: 'Bypass an electronic lock or security system. DC 7 Tech check.',
        tags: ['tech', 'stealth'],
      },
    ],
    startingTraits: [
      {
        id: 'systems_intuition',
        name: 'Systems Intuition',
        description: 'You can diagnose any mechanical or electronic system with a look.',
        modifier: { tech: 1 },
      },
    ],
    genres: ['sci-fi', 'cyberpunk', 'modern', 'mixed'],
  },

  {
    id: 'ranger',
    name: 'Ranger / Hunter',
    taglines: ['ranger', 'hunter', 'scout', 'tracker', 'ranger', 'marksman', 'survivalist', 'forager', 'woodsman'],
    description: 'A wilderness expert who reads land and weather, hunts prey, and moves unseen.',
    primaryStats: ['perception', 'agility'],
    startingSkills: { 'Tracking': 2, 'Survival': 2, 'Ranged Combat': 1 },
    startingAbilities: [
      {
        id: 'hunters_eye',
        name: "Hunter's Eye",
        description: 'Gain advantage on first ranged attack against an unaware target each scene.',
        tags: ['combat', 'ranged', 'passive'],
      },
      {
        id: 'wilderness_lore',
        name: 'Wilderness Lore',
        description: 'Navigate, forage, and predict weather without a roll in familiar terrain.',
        tags: ['survival', 'exploration'],
      },
    ],
    startingTraits: [
      {
        id: 'natural_camouflage',
        name: 'Natural Camouflage',
        description: 'Gain +1 to Stealth rolls in natural environments.',
        modifier: { agility: 1 },
      },
    ],
    genres: ['fantasy', 'historical', 'zombie', 'sci-fi', 'mixed'],
  },

  {
    id: 'diplomat',
    name: 'Diplomat / Fixer',
    taglines: ['diplomat', 'fixer', 'broker', 'negotiator', 'politician', 'face', 'handler', 'liaison'],
    description: 'A silver-tongued operator who navigates social webs and bends people to their will.',
    primaryStats: ['charisma', 'intellect'],
    startingSkills: { 'Persuasion': 3, 'Insight': 2, 'Deception': 1 },
    startingAbilities: [
      {
        id: 'silver_tongue',
        name: 'Silver Tongue',
        description: 'Re-roll one failed Social check per scene. Take the better result.',
        uses: 1,
        tags: ['social', 'passive'],
      },
      {
        id: 'read_the_room',
        name: 'Read the Room',
        description: 'Sense the general mood and hidden agenda of a group with DC 5 Insight.',
        tags: ['social', 'exploration'],
      },
    ],
    startingTraits: [
      {
        id: 'well_connected',
        name: 'Well Connected',
        description: 'In any settlement, you know someone who knows someone.',
        modifier: { charisma: 1 },
      },
    ],
    genres: ['fantasy', 'modern', 'sci-fi', 'cyberpunk', 'historical', 'mixed'],
  },

  {
    id: 'psi',
    name: 'Psionicist',
    taglines: ['psi', 'psion', 'psychic', 'mentalist', 'esper', 'telepath', 'empath'],
    description: 'A mind-wielder who reads thoughts, bends will, and projects lethal force.',
    primaryStats: ['psionics', 'willpower'],
    startingSkills: { 'Psi Control': 2, 'Meditation': 1, 'Insight': 2 },
    startingAbilities: [
      {
        id: 'mind_thrust',
        name: 'Mind Thrust',
        description: 'Attack a target\'s mind for 1d10 psychic damage. DC 7 Willpower to resist.',
        cost: '2 Psi',
        tags: ['psi', 'combat'],
      },
      {
        id: 'telepath',
        name: 'Surface Read',
        description: 'Read surface thoughts of one consenting or stunned target.',
        cost: '1 Psi',
        tags: ['psi', 'social'],
      },
    ],
    startingTraits: [
      {
        id: 'mental_fortress',
        name: 'Mental Fortress',
        description: 'You are immune to fear effects and gain +1 to Willpower saves.',
        modifier: { willpower: 1 },
      },
    ],
    genres: ['sci-fi', 'cyberpunk', 'mixed'],
  },
];

// ─── Archetype Matching ───────────────────────────────────────

/** Score how well an archetype matches a tagline string */
export function scoreArchetypeMatch(
  template: ArchetypeTemplate,
  tagline: string
): number {
  const lower = tagline.toLowerCase();
  let score = 0;
  for (const kw of template.taglines) {
    if (lower.includes(kw)) score += 2;
  }
  if (lower.includes(template.name.toLowerCase())) score += 3;
  return score;
}

/** Find best matching archetype for a tagline, or return warrior as default */
export function matchArchetype(
  tagline: string,
  genre: Genre
): ArchetypeTemplate {
  let best: ArchetypeTemplate = ARCHETYPE_TEMPLATES[0];
  let bestScore = -1;

  for (const tmpl of ARCHETYPE_TEMPLATES) {
    // Prefer archetypes that support this genre
    const genreBonus = tmpl.genres.includes(genre) ? 1 : 0;
    const score = scoreArchetypeMatch(tmpl, tagline) + genreBonus;
    if (score > bestScore) {
      bestScore = score;
      best = tmpl;
    }
  }
  return best;
}

/** Get archetypes valid for a given genre */
export function archetypesForGenre(genre: Genre): ArchetypeTemplate[] {
  return ARCHETYPE_TEMPLATES.filter((a) => a.genres.includes(genre));
}
