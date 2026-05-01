// ============================================================
// USRE — Ultimate Sandbox RPG Engine
// Core Type Definitions
// ============================================================

// ─── Primitives ──────────────────────────────────────────────

export type Genre =
  | 'fantasy'
  | 'sci-fi'
  | 'zombie'
  | 'modern'
  | 'cyberpunk'
  | 'historical'
  | 'mixed';

export type SurvivalMeter =
  | 'hunger'
  | 'thirst'
  | 'temperature'
  | 'fatigue'
  | 'radiation'
  | 'disease';

export type StatBudget = 'standard' | 'hard' | 'heroic';

export type DeathRule =
  | 'permadeath'
  | 'respawn'
  | 'reincarnate'
  | 'new_char_same_world';

export type ClockCategory = 'threat' | 'opportunity' | 'event' | 'personal';

export type Advantage = 'advantage' | 'disadvantage' | 'none';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type MessageType =
  | 'narrative'
  | 'system'
  | 'roll'
  | 'command'
  | 'options'
  | 'setup'
  | 'error'
  | 'success'
  | 'separator'
  | 'char_creation';

export type AppMode = 'home' | 'setup' | 'char_creation' | 'play' | 'load';

export type EconomyIntensity = 1 | 2 | 3;

// ─── Game Configuration ───────────────────────────────────────

export interface SetupAnswers {
  q1_genre: Genre;
  q2_mixSecondGenre: boolean;
  q3_secondGenre: Genre | null;
  q4_apocalypse: boolean;
  q5_magicLevel: number;
  q6_techLevel: number;
  q7_supernaturalLevel: number;
  q8_grittyTone: boolean;
  q9_combatLethality: number;
  q10_survivalEnabled: boolean;
  q11_survivalMeters: SurvivalMeter[];
  q12_worldScale: number;
  q13_majorRegions: number;
  q14_intelligentSpecies: number;
  q15_majorFactions: number;
  q16_randomEventFrequency: number;
  q17_npcComplexity: number;
  q18_startingPowerLevel: number;
  q19_statBudget: StatBudget;
  q20_levelCap: number | 'limitless';
  q21_deathRule: DeathRule;
  q22_hexExploration: boolean;
  q23_economyIntensity: EconomyIntensity;
  q24_secretDensity: number;
  q25_archetypeTagline: string;
}

export interface GameConfig {
  genre: Genre;
  secondGenre: Genre | null;
  hasApocalypse: boolean;
  magicLevel: number;
  techLevel: number;
  supernaturalLevel: number;
  grittyTone: boolean;
  combatLethality: number;
  survivalEnabled: boolean;
  survivalMeters: SurvivalMeter[];
  worldScale: number;
  majorRegionsCount: number;
  intelligentSpeciesCount: number;
  majorFactionsCount: number;
  randomEventFrequency: number;
  npcComplexity: number;
  startingPowerLevel: number;
  statBudget: StatBudget;
  levelCap: number | 'limitless';
  deathRule: DeathRule;
  hexExploration: boolean;
  economyIntensity: EconomyIntensity;
  secretDensity: number;
  archetypeTagline: string;
}

export interface GameToggles {
  survival: boolean;
  crafting: boolean;
  stealth: boolean;
  social: boolean;
  magic: number;
  tech: number;
  psionics: number;
  hex: boolean;
}

// ─── Character ────────────────────────────────────────────────

export interface Stats {
  strength: number;
  agility: number;
  endurance: number;
  perception: number;
  intellect: number;
  willpower: number;
  charisma: number;
  luck: number;
  tech?: number;
  magic?: number;
  psionics?: number;
}

export type StatKey = keyof Stats;

export interface Track {
  current: number;
  max: number;
  label: string;
  color?: string;
}

export interface Tracks {
  hp: Track;
  stamina: Track;
  mana?: Track;
  psi?: Track;
  hunger?: Track;
  thirst?: Track;
  temperature?: Track;
  fatigue?: Track;
  radiation?: Track;
  disease?: Track;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cost?: string;
  uses?: number | 'unlimited';
  tags: string[];
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  modifier?: Partial<Stats>;
  tags?: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  weight: number;
  value: number;
  tags: string[];
  modifier?: number;
  equipped?: boolean;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  offhand?: Item;
  accessory1?: Item;
  accessory2?: Item;
}

export interface Connection {
  name: string;
  relationship: string;
  npcId?: string;
  notes: string;
}

export interface Character {
  name: string;
  archetype: string;
  species: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: Stats;
  tracks: Tracks;
  skills: Record<string, number>;
  abilities: Ability[];
  traits: Trait[];
  inventory: Item[];
  equipment: Equipment;
  reputation: Record<string, number>;
  connections: Connection[];
  backstory: string;
  appearance: string;
  notes: string;
}

// ─── World State ──────────────────────────────────────────────

export interface HexCoords {
  q: number;
  r: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  explored: boolean;
  tags: string[];
}

export interface Region {
  id: string;
  name: string;
  description: string;
  climate: string;
  dangerLevel: number;
  factionControl: Record<string, number>;
  resources: string[];
  pointsOfInterest: PointOfInterest[];
  connections: string[];
  explored: boolean;
  hexCoords?: HexCoords;
  tags: string[];
}

export interface FactionRelation {
  factionId: string;
  attitude: number;
  notes: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  attitude: number;
  power: number;
  goals: string[];
  resources: string[];
  memberIds: string[];
  territory: string[];
  relations: FactionRelation[];
  tags: string[];
}

export interface NPC {
  id: string;
  name: string;
  species: string;
  role: string;
  factionId: string | null;
  disposition: number;
  stats?: Partial<Stats>;
  notes: string;
  isMinor: boolean;
  lastSeenRegion: string;
  alive: boolean;
  tags: string[];
  backstory?: string;
}

export interface Clock {
  id: string;
  name: string;
  description: string;
  ticks: number;
  maxTicks: number;
  category: ClockCategory;
  onComplete: string;
  active: boolean;
  regionId?: string;
  factionId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: string[];
  giverId: string | null;
  regionId: string | null;
  turnStarted: number;
  turnCompleted?: number;
  tags: string[];
}

export interface QuestLog {
  active: Quest[];
  completed: Quest[];
  failed: Quest[];
}

export interface TradeRoute {
  from: string;
  to: string;
  goods: string[];
}

export interface EconomyNode {
  regionId: string;
  supply: Record<string, number>;
  demand: Record<string, number>;
  priceModifiers: Record<string, number>;
}

export interface Economy {
  nodes: EconomyNode[];
  globalModifiers: Record<string, number>;
  tradeRoutes: TradeRoute[];
}

export interface WorldTime {
  day: number;
  hour: number;
  season: Season;
  year: number;
}

export interface Weather {
  current: string;
  severity: number;
  duration: number;
}

export interface Secret {
  id: string;
  description: string;
  discovered: boolean;
  relatedIds: string[];
  hint?: string;
}

export interface WorldState {
  regions: Region[];
  factions: Faction[];
  npcs: NPC[];
  clocks: Clock[];
  quests: QuestLog;
  economy: Economy;
  time: WorldTime;
  weather: Weather;
  secrets: Secret[];
  flags: Record<string, unknown>;
}

// ─── Location ─────────────────────────────────────────────────

export interface Location {
  regionId: string;
  regionName: string;
  subLocation?: string;
  description?: string;
}

// ─── Roll System ──────────────────────────────────────────────

export interface RollResult {
  dice: number[];
  kept: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  isCrit: boolean;
  isFumble: boolean;
  isAutoSuccess: boolean;
  advantage: Advantage;
  statUsed?: StatKey;
  skillUsed?: string;
  breakdown: string;
  timestamp: number;
  turn: number;
}

export interface ActionResolutionParams {
  action: string;
  dc: number;
  statKey: StatKey;
  skillKey?: string;
  advantage?: Advantage;
  additionalModifier?: number;
}

// ─── Turn System ──────────────────────────────────────────────

export interface TurnRecord {
  turn: number;
  timestamp: number;
  action: string;
  result: string;
  rollResult?: RollResult;
  consequences: string[];
  worldChanges: string[];
}

export interface TurnState {
  turnNumber: number;
  situation: string;
  options: string[];
  lastAction: string | null;
  lastRoll: RollResult | null;
  pendingConsequences: string[];
}

// ─── Chat Messages ────────────────────────────────────────────

export interface GameMessage {
  id: string;
  type: MessageType;
  content: string;
  rollResult?: RollResult;
  options?: string[];
  timestamp: number;
  turn?: number;
}

// ─── Save State ───────────────────────────────────────────────

export interface WorldBible {
  regions_compact: Array<{ id: string; name: string; summary: string }>;
  species_compact: Array<{ name: string; summary: string }>;
  factions_compact: Array<{ id: string; name: string; summary: string }>;
  economy_compact: string;
  key_npcs_compact: Array<{ id: string; name: string; summary: string }>;
  quest_seeds: string[];
  global_clocks: Clock[];
  known_secrets_compact: string;
}

export interface SaveState {
  session_id: string;
  turn: number;
  timestamp: string;
  rng_seed: number;
  genre: Genre;
  config: {
    answers_to_Q1_Q25: SetupAnswers;
    level_cap: number | 'limitless';
    death_rule: DeathRule;
  };
  toggles: GameToggles;
  PC: Character;
  location: Location;
  time: WorldTime;
  inventory: Item[];
  resources: Record<string, number>;
  known_npcs: NPC[];
  factions: Faction[];
  regions: Region[];
  quests: QuestLog;
  clocks: Clock[];
  flags: Record<string, unknown>;
  timeline: TurnRecord[];
  random_log: RollResult[];
  action_tags: string[];
  World_Bible: WorldBible;
  rules_house: Record<string, unknown>;
  bookmarks: Array<{ label: string; turn: number; timestamp: string }>;
  history_abridged: string;
}

export interface Checkpoint {
  label: string;
  turn: number;
  timestamp: string;
  state: SaveState;
}

// ─── Session Metadata (save browser) ─────────────────────────

export interface SessionMeta {
  session_id: string;
  name: string;
  genre: Genre;
  archetype: string;
  turn: number;
  timestamp: string;
  isCheckpoint: boolean;
  isIronman: boolean;
}

// ─── Commands ─────────────────────────────────────────────────

export type CommandName =
  | 'save'
  | 'export'
  | 'load'
  | 'sheet'
  | 'log'
  | 'undo'
  | 'bookmark'
  | 'note'
  | 'seed'
  | 'help';

export interface ParsedCommand {
  command: CommandName;
  args: string[];
  raw: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// ─── Narrative Adapter ────────────────────────────────────────

export interface NarrativeContext {
  turn: number;
  location: Location;
  character: Character;
  world: WorldState;
  config: GameConfig;
  lastAction?: string;
  lastResult?: string;
  recentHistory: TurnRecord[];
}

export interface NarrativeOutput {
  situation: string;
  options: string[];
  mood?: string;
}

export interface NarrativeAdapter {
  generateSituation(ctx: NarrativeContext): Promise<NarrativeOutput>;
  generateConsequence(
    action: string,
    roll: RollResult | null,
    ctx: NarrativeContext
  ): Promise<string>;
}

// ─── Setup Flow ───────────────────────────────────────────────

export type SetupAnswerKey = keyof SetupAnswers;

export interface SetupQuestion {
  id: SetupAnswerKey;
  number: number;
  prompt: string;
  hint: string;
  type:
    | 'genre'
    | 'yesno'
    | 'number'
    | 'choice'
    | 'text'
    | 'meters'
    | 'optional_genre';
  options?: string[];
  min?: number;
  max?: number;
  defaultValue?: unknown;
  validate: (
    input: string,
    answers: Partial<SetupAnswers>
  ) => { valid: boolean; value?: unknown; error?: string };
}

export type SetupPhase =
  | { status: 'questions'; currentQ: number; answers: Partial<SetupAnswers> }
  | { status: 'summary'; answers: SetupAnswers; summary: string }
  | { status: 'char_creation'; config: GameConfig };

// ─── Species Template ─────────────────────────────────────────

export interface SpeciesTemplate {
  id: string;
  name: string;
  description: string;
  statModifiers: Partial<Stats>;
  traits: Trait[];
  genres: Genre[];
}

// ─── Archetype Template ───────────────────────────────────────

export interface ArchetypeTemplate {
  id: string;
  name: string;
  taglines: string[];
  description: string;
  primaryStats: StatKey[];
  startingSkills: Record<string, number>;
  startingAbilities: Ability[];
  startingTraits: Trait[];
  genres: Genre[];
}

// ─── Character Creation State ─────────────────────────────────

export interface CharCreationState {
  step:
    | 'name'
    | 'species'
    | 'archetype'
    | 'stats'
    | 'traits'
    | 'backstory'
    | 'review';
  name: string;
  species: SpeciesTemplate | null;
  archetype: ArchetypeTemplate | null;
  stats: Stats | null;
  remainingBudget: number;
  selectedTraits: Trait[];
  backstory: string;
  appearance: string;
  connections: Connection[];
}

// ─── UI State ─────────────────────────────────────────────────

export type SidePanelTab =
  | 'sheet'
  | 'inventory'
  | 'quests'
  | 'npcs'
  | 'factions'
  | 'clocks'
  | 'world'
  | 'saves';

export interface UIState {
  mode: AppMode;
  sidePanelTab: SidePanelTab;
  sidePanelOpen: boolean;
  jsonModalOpen: boolean;
  jsonModalContent: string;
  jsonModalMode: 'export' | 'import';
  rollLogOpen: boolean;
  settingsOpen: boolean;
  errorMessage: string | null;
}

// ─── World Generation Input ───────────────────────────────────

export interface WorldGenInput {
  config: GameConfig;
  seed: number;
}
