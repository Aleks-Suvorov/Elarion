import { z } from 'zod';

// ─── Primitive Schemas ────────────────────────────────────────

const GenreSchema = z.enum([
  'fantasy',
  'sci-fi',
  'zombie',
  'modern',
  'cyberpunk',
  'historical',
  'mixed',
]);

const SurvivalMeterSchema = z.enum([
  'hunger',
  'thirst',
  'temperature',
  'fatigue',
  'radiation',
  'disease',
]);

const DeathRuleSchema = z.enum([
  'permadeath',
  'respawn',
  'reincarnate',
  'new_char_same_world',
]);

const StatBudgetSchema = z.enum(['standard', 'hard', 'heroic']);

const AdvantageSchema = z.enum(['advantage', 'disadvantage', 'none']);

const ClockCategorySchema = z.enum([
  'threat',
  'opportunity',
  'event',
  'personal',
]);

const SeasonSchema = z.enum(['spring', 'summer', 'autumn', 'winter']);

// ─── Setup Answers Schema ─────────────────────────────────────

export const SetupAnswersSchema = z.object({
  q1_genre: GenreSchema,
  q2_mixSecondGenre: z.boolean(),
  q3_secondGenre: GenreSchema.nullable(),
  q4_apocalypse: z.boolean(),
  q5_magicLevel: z.number().int().min(0).max(10),
  q6_techLevel: z.number().int().min(0).max(10),
  q7_supernaturalLevel: z.number().int().min(0).max(10),
  q8_grittyTone: z.boolean(),
  q9_combatLethality: z.number().int().min(1).max(10),
  q10_survivalEnabled: z.boolean(),
  q11_survivalMeters: z.array(SurvivalMeterSchema),
  q12_worldScale: z.number().int().min(1).max(5),
  q13_majorRegions: z.number().int().min(1).max(10),
  q14_intelligentSpecies: z.number().int().min(1).max(10),
  q15_majorFactions: z.number().int().min(1).max(10),
  q16_randomEventFrequency: z.number().int().min(0).max(10),
  q17_npcComplexity: z.number().int().min(1).max(5),
  q18_startingPowerLevel: z.number().int().min(1).max(10),
  q19_statBudget: StatBudgetSchema,
  q20_levelCap: z.union([z.number().int().positive(), z.literal('limitless')]),
  q21_deathRule: DeathRuleSchema,
  q22_hexExploration: z.boolean(),
  q23_economyIntensity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  q24_secretDensity: z.number().int().min(1).max(10),
  q25_archetypeTagline: z.string().min(2).max(60),
});

// ─── Stats ────────────────────────────────────────────────────

const StatsSchema = z.object({
  strength: z.number().int().min(1).max(10),
  agility: z.number().int().min(1).max(10),
  endurance: z.number().int().min(1).max(10),
  perception: z.number().int().min(1).max(10),
  intellect: z.number().int().min(1).max(10),
  willpower: z.number().int().min(1).max(10),
  charisma: z.number().int().min(1).max(10),
  luck: z.number().int().min(1).max(10),
  tech: z.number().int().min(1).max(10).optional(),
  magic: z.number().int().min(1).max(10).optional(),
  psionics: z.number().int().min(1).max(10).optional(),
});

const TrackSchema = z.object({
  current: z.number(),
  max: z.number(),
  label: z.string(),
  color: z.string().optional(),
});

const TracksSchema = z.object({
  hp: TrackSchema,
  stamina: TrackSchema,
  mana: TrackSchema.optional(),
  psi: TrackSchema.optional(),
  hunger: TrackSchema.optional(),
  thirst: TrackSchema.optional(),
  temperature: TrackSchema.optional(),
  fatigue: TrackSchema.optional(),
  radiation: TrackSchema.optional(),
  disease: TrackSchema.optional(),
});

// ─── Character Schema ─────────────────────────────────────────

const AbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cost: z.string().optional(),
  uses: z.union([z.number().int().nonnegative(), z.literal('unlimited')]).optional(),
  tags: z.array(z.string()),
});

const TraitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  modifier: StatsSchema.partial().optional(),
  tags: z.array(z.string()).optional(),
});

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  quantity: z.number().int().nonnegative(),
  weight: z.number().nonnegative(),
  value: z.number().nonnegative(),
  tags: z.array(z.string()),
  modifier: z.number().optional(),
  equipped: z.boolean().optional(),
});

const EquipmentSchema = z.object({
  weapon: ItemSchema.optional(),
  armor: ItemSchema.optional(),
  offhand: ItemSchema.optional(),
  accessory1: ItemSchema.optional(),
  accessory2: ItemSchema.optional(),
});

const ConnectionSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  npcId: z.string().optional(),
  notes: z.string(),
});

export const CharacterSchema = z.object({
  name: z.string().min(1).max(60),
  archetype: z.string(),
  species: z.string(),
  level: z.number().int().min(1),
  xp: z.number().int().nonnegative(),
  xpToNext: z.number().int().nonnegative(),
  stats: StatsSchema,
  tracks: TracksSchema,
  skills: z.record(z.string(), z.number().int()),
  abilities: z.array(AbilitySchema),
  traits: z.array(TraitSchema),
  inventory: z.array(ItemSchema),
  equipment: EquipmentSchema,
  reputation: z.record(z.string(), z.number()),
  connections: z.array(ConnectionSchema),
  backstory: z.string(),
  appearance: z.string(),
  notes: z.string(),
});

// ─── World Schemas ────────────────────────────────────────────

const HexCoordsSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});

const PointOfInterestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  explored: z.boolean(),
  tags: z.array(z.string()),
});

const RegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  climate: z.string(),
  dangerLevel: z.number().int().min(1).max(10),
  factionControl: z.record(z.string(), z.number()),
  resources: z.array(z.string()),
  pointsOfInterest: z.array(PointOfInterestSchema),
  connections: z.array(z.string()),
  explored: z.boolean(),
  hexCoords: HexCoordsSchema.optional(),
  tags: z.array(z.string()),
});

const FactionRelationSchema = z.object({
  factionId: z.string(),
  attitude: z.number().min(-100).max(100),
  notes: z.string(),
});

const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  attitude: z.number().min(-100).max(100),
  power: z.number().int().min(1).max(10),
  goals: z.array(z.string()),
  resources: z.array(z.string()),
  memberIds: z.array(z.string()),
  territory: z.array(z.string()),
  relations: z.array(FactionRelationSchema),
  tags: z.array(z.string()),
});

const NPCSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: z.string(),
  role: z.string(),
  factionId: z.string().nullable(),
  disposition: z.number().min(-100).max(100),
  stats: StatsSchema.partial().optional(),
  notes: z.string(),
  isMinor: z.boolean(),
  lastSeenRegion: z.string(),
  alive: z.boolean(),
  tags: z.array(z.string()),
  backstory: z.string().optional(),
});

const ClockSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  ticks: z.number().int().nonnegative(),
  maxTicks: z.number().int().positive(),
  category: ClockCategorySchema,
  onComplete: z.string(),
  active: z.boolean(),
  regionId: z.string().optional(),
  factionId: z.string().optional(),
});

const QuestObjectiveSchema = z.object({
  id: z.string(),
  description: z.string(),
  completed: z.boolean(),
  optional: z.boolean(),
});

const QuestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  objectives: z.array(QuestObjectiveSchema),
  rewards: z.array(z.string()),
  giverId: z.string().nullable(),
  regionId: z.string().nullable(),
  turnStarted: z.number().int(),
  turnCompleted: z.number().int().optional(),
  tags: z.array(z.string()),
});

const QuestLogSchema = z.object({
  active: z.array(QuestSchema),
  completed: z.array(QuestSchema),
  failed: z.array(QuestSchema),
});

// ─── Roll Result Schema ───────────────────────────────────────

export const RollResultSchema = z.object({
  dice: z.array(z.number().int().min(1).max(10)),
  kept: z.number().int().min(0).max(10),
  modifier: z.number().int(),
  total: z.number().int(),
  dc: z.number().int(),
  success: z.boolean(),
  isCrit: z.boolean(),
  isFumble: z.boolean(),
  isAutoSuccess: z.boolean(),
  advantage: AdvantageSchema,
  statUsed: z.string().optional(),
  skillUsed: z.string().optional(),
  breakdown: z.string(),
  timestamp: z.number().int(),
  turn: z.number().int(),
});

// ─── Turn Record Schema ───────────────────────────────────────

const TurnRecordSchema = z.object({
  turn: z.number().int(),
  timestamp: z.number().int(),
  action: z.string(),
  result: z.string(),
  rollResult: RollResultSchema.optional(),
  consequences: z.array(z.string()),
  worldChanges: z.array(z.string()),
});

// ─── Location Schema ──────────────────────────────────────────

const LocationSchema = z.object({
  regionId: z.string(),
  regionName: z.string(),
  subLocation: z.string().optional(),
  description: z.string().optional(),
});

const WorldTimeSchema = z.object({
  day: z.number().int().positive(),
  hour: z.number().int().min(0).max(23),
  season: SeasonSchema,
  year: z.number().int().positive(),
});

// ─── World Bible Schema ───────────────────────────────────────

const WorldBibleSchema = z.object({
  regions_compact: z.array(
    z.object({ id: z.string(), name: z.string(), summary: z.string() })
  ),
  species_compact: z.array(
    z.object({ name: z.string(), summary: z.string() })
  ),
  factions_compact: z.array(
    z.object({ id: z.string(), name: z.string(), summary: z.string() })
  ),
  economy_compact: z.string(),
  key_npcs_compact: z.array(
    z.object({ id: z.string(), name: z.string(), summary: z.string() })
  ),
  quest_seeds: z.array(z.string()),
  global_clocks: z.array(ClockSchema),
  known_secrets_compact: z.string(),
});

// ─── Game Toggles Schema ──────────────────────────────────────

const GameTogglesSchema = z.object({
  survival: z.boolean(),
  crafting: z.boolean(),
  stealth: z.boolean(),
  social: z.boolean(),
  magic: z.number().int().min(0).max(10),
  tech: z.number().int().min(0).max(10),
  psionics: z.number().int().min(0).max(10),
  hex: z.boolean(),
});

// ─── Bookmark Schema ──────────────────────────────────────────

const BookmarkSchema = z.object({
  label: z.string(),
  turn: z.number().int(),
  timestamp: z.string(),
});

// ─── Full Save State Schema ───────────────────────────────────

export const SaveStateSchema = z.object({
  session_id: z.string().uuid(),
  turn: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
  rng_seed: z.number().int(),
  genre: GenreSchema,
  config: z.object({
    answers_to_Q1_Q25: SetupAnswersSchema,
    level_cap: z.union([z.number().int().positive(), z.literal('limitless')]),
    death_rule: DeathRuleSchema,
  }),
  toggles: GameTogglesSchema,
  PC: CharacterSchema,
  location: LocationSchema,
  time: WorldTimeSchema,
  inventory: z.array(ItemSchema),
  resources: z.record(z.string(), z.number()),
  known_npcs: z.array(NPCSchema),
  factions: z.array(FactionSchema),
  regions: z.array(RegionSchema),
  quests: QuestLogSchema,
  clocks: z.array(ClockSchema),
  flags: z.record(z.string(), z.unknown()),
  timeline: z.array(TurnRecordSchema),
  random_log: z.array(RollResultSchema),
  action_tags: z.array(z.string()),
  World_Bible: WorldBibleSchema,
  rules_house: z.record(z.string(), z.unknown()),
  bookmarks: z.array(BookmarkSchema),
  history_abridged: z.string(),
});

// ─── Validation Helpers ───────────────────────────────────────

export type SaveStateInput = z.input<typeof SaveStateSchema>;
export type SaveStateOutput = z.output<typeof SaveStateSchema>;

export function validateSaveState(
  data: unknown
): { success: true; data: SaveStateOutput } | { success: false; errors: string[] } {
  const result = SaveStateSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`
  );
  return { success: false, errors };
}

export function validateSetupAnswers(
  data: unknown
): { success: true; data: z.output<typeof SetupAnswersSchema> } | { success: false; errors: string[] } {
  const result = SetupAnswersSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`
  );
  return { success: false, errors };
}
