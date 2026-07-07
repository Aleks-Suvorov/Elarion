import { create } from 'zustand';
import type {
  SaveState,
  GameConfig,
  GameToggles,
  Character,
  WorldState,
  Location,
  WorldTime,
  TurnRecord,
  RollResult,
  GameMessage,
  SetupAnswers,
  CharCreationState,
  SetupPhase,
  Item,
  StatKey,
  NPC,
} from '../types';
import { createRNG, randomSeed, type RNG } from '../lib/rng';

// ─── Store Shape ──────────────────────────────────────────────

interface GameStore {
  // Session
  sessionId: string | null;
  rngSeed: number;
  rng: RNG | null;
  turn: number;

  // Config (post-setup)
  config: GameConfig | null;
  toggles: GameToggles | null;
  setupAnswers: SetupAnswers | null;
  setupPhase: SetupPhase;

  // Character creation
  charCreation: CharCreationState | null;

  // World
  world: WorldState | null;
  character: Character | null;
  location: Location | null;

  // History
  messages: GameMessage[];
  timeline: TurnRecord[];
  rollLog: RollResult[];
  bookmarks: Array<{ label: string; turn: number; timestamp: string }>;
  actionTags: string[];
  notes: string[];
  historyAbridged: string;

  // Resources
  resources: Record<string, number>;
  flags: Record<string, unknown>;

  // ─── Setup Phase ──────────────────────────────────────────
  startSetup(): void;
  setSetupPhase(phase: SetupPhase): void;
  applySetupAnswer(questionId: keyof SetupAnswers, value: unknown): void;

  // ─── World/Session ────────────────────────────────────────
  initSession(
    config: GameConfig,
    toggles: GameToggles,
    world: WorldState,
    location: Location,
    answers: SetupAnswers
  ): void;

  // ─── Character ────────────────────────────────────────────
  setCharCreation(state: CharCreationState): void;
  finalizeCharacter(character: Character): void;
  updateCharacter(updates: Partial<Character>): void;
  applyHPDelta(delta: number): void;
  applyStaminaDelta(delta: number): void;
  addItemToInventory(item: Item): void;
  removeItemFromInventory(itemId: string, qty?: number): void;
  grantXP(amount: number): void;

  // ─── Turn Loop ────────────────────────────────────────────
  incrementTurn(): void;
  addMessage(message: Omit<GameMessage, 'id' | 'timestamp'>): void;
  addRollResult(roll: RollResult): void;
  addTurnRecord(record: TurnRecord): void;
  clearMessages(): void;

  // ─── World Mutations ──────────────────────────────────────
  setWorld(world: WorldState): void;
  setLocation(location: Location): void;
  updateWorldFlags(updates: Record<string, unknown>): void;
  tickWorldClock(clockId: string): void;
  updateNPC(npcId: string, updates: Partial<NPC>): void;

  // ─── Commands ─────────────────────────────────────────────
  addBookmark(label: string): void;
  addNote(text: string): void;
  reseed(seed: number): void;
  addActionTag(tag: string): void;

  // ─── Save/Load ────────────────────────────────────────────
  buildSaveState(): SaveState | null;
  loadFromSaveState(state: SaveState): void;
  setHistoryAbridged(text: string): void;

  // ─── RNG ──────────────────────────────────────────────────
  getRNG(): RNG;
}

// ─── ID Helper ────────────────────────────────────────────────
function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// ─── Initial Setup Phase ──────────────────────────────────────

const INITIAL_SETUP_PHASE: SetupPhase = {
  status: 'questions',
  currentQ: 0,
  answers: {},
};

// ─── Store ────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  sessionId: null,
  rngSeed: 0,
  rng: null,
  turn: 0,
  config: null,
  toggles: null,
  setupAnswers: null,
  setupPhase: INITIAL_SETUP_PHASE,
  charCreation: null,
  world: null,
  character: null,
  location: null,
  messages: [],
  timeline: [],
  rollLog: [],
  bookmarks: [],
  actionTags: [],
  notes: [],
  historyAbridged: '',
  resources: {},
  flags: {},

  // ─── Setup ───────────────────────────────────────────────

  startSetup() {
    set({
      setupPhase: { status: 'questions', currentQ: 0, answers: {} },
      sessionId: newId(),
    });
  },

  setSetupPhase(phase) {
    set({ setupPhase: phase });
  },

  applySetupAnswer(questionId, value) {
    const { setupPhase } = get();
    if (setupPhase.status !== 'questions') return;
    const newAnswers = { ...setupPhase.answers, [questionId]: value };
    set({
      setupPhase: {
        status: 'questions',
        currentQ: setupPhase.currentQ + 1,
        answers: newAnswers,
      },
    });
  },

  // ─── Session Init ─────────────────────────────────────────

  initSession(config, toggles, world, location, answers) {
    const seed = randomSeed();
    const rng = createRNG(seed);
    set({
      config,
      toggles,
      world,
      location,
      setupAnswers: answers,
      rngSeed: seed,
      rng,
      turn: 0,
      timeline: [],
      rollLog: [],
      bookmarks: [],
      actionTags: [],
      notes: [],
      historyAbridged: '',
      resources: {},
      flags: {},
      messages: [],
    });
  },

  // ─── Character ───────────────────────────────────────────

  setCharCreation(state) {
    set({ charCreation: state });
  },

  finalizeCharacter(character) {
    set({ character, charCreation: null });
  },

  updateCharacter(updates) {
    const { character } = get();
    if (!character) return;
    set({ character: { ...character, ...updates } });
  },

  applyHPDelta(delta) {
    const { character } = get();
    if (!character) return;
    const hp = character.tracks.hp;
    const newCurrent = Math.max(0, Math.min(hp.max, hp.current + delta));
    set({
      character: {
        ...character,
        tracks: {
          ...character.tracks,
          hp: { ...hp, current: newCurrent },
        },
      },
    });
  },

  applyStaminaDelta(delta) {
    const { character } = get();
    if (!character) return;
    const stamina = character.tracks.stamina;
    const newCurrent = Math.max(0, Math.min(stamina.max, stamina.current + delta));
    set({
      character: {
        ...character,
        tracks: {
          ...character.tracks,
          stamina: { ...stamina, current: newCurrent },
        },
      },
    });
  },

  addItemToInventory(item) {
    const { character } = get();
    if (!character) return;
    const existing = character.inventory.find((i) => i.id === item.id);
    let newInventory: Item[];
    if (existing) {
      newInventory = character.inventory.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newInventory = [...character.inventory, item];
    }
    set({ character: { ...character, inventory: newInventory } });
  },

  removeItemFromInventory(itemId, qty = 1) {
    const { character } = get();
    if (!character) return;
    const newInventory = character.inventory
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - qty } : i))
      .filter((i) => i.quantity > 0);
    set({ character: { ...character, inventory: newInventory } });
  },

  grantXP(amount) {
    const { character } = get();
    if (!character) return;
    const newXP = character.xp + amount;
    set({ character: { ...character, xp: newXP } });
  },

  // ─── Turn Loop ───────────────────────────────────────────

  incrementTurn() {
    set((s) => ({ turn: s.turn + 1 }));
  },

  addMessage(message) {
    const msg: GameMessage = {
      ...message,
      id: newId(),
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: [...s.messages, msg],
    }));
  },

  addRollResult(roll) {
    set((s) => ({
      rollLog: [roll, ...s.rollLog].slice(0, 200),
    }));
  },

  addTurnRecord(record) {
    set((s) => ({
      timeline: [...s.timeline, record],
    }));
  },

  clearMessages() {
    set({ messages: [] });
  },

  // ─── World ───────────────────────────────────────────────

  setWorld(world) {
    set({ world });
  },

  setLocation(location) {
    set({ location });
  },

  updateWorldFlags(updates) {
    set((s) => ({ flags: { ...s.flags, ...updates } }));
  },

  tickWorldClock(clockId) {
    const { world } = get();
    if (!world) return;
    const clocks = world.clocks.map((c) =>
      c.id === clockId ? { ...c, ticks: Math.min(c.ticks + 1, c.maxTicks) } : c
    );
    set({ world: { ...world, clocks } });
  },

  updateNPC(npcId, updates) {
    const { world } = get();
    if (!world) return;
    const npcs = world.npcs.map((n) =>
      n.id === npcId ? { ...n, ...updates } : n
    );
    set({ world: { ...world, npcs } });
  },

  // ─── Commands ────────────────────────────────────────────

  addBookmark(label) {
    const { turn } = get();
    set((s) => ({
      bookmarks: [
        ...s.bookmarks,
        { label, turn, timestamp: new Date().toISOString() },
      ],
    }));
  },

  addNote(text) {
    set((s) => ({ notes: [...s.notes, text] }));
  },

  reseed(seed) {
    const rng = createRNG(seed);
    set({ rngSeed: seed, rng });
  },

  addActionTag(tag) {
    set((s) => ({ actionTags: [...s.actionTags, tag] }));
  },

  // ─── Save/Load ───────────────────────────────────────────

  buildSaveState(): SaveState | null {
    const s = get();
    if (
      !s.sessionId ||
      !s.config ||
      !s.toggles ||
      !s.character ||
      !s.world ||
      !s.location ||
      !s.setupAnswers
    ) {
      return null;
    }

    return {
      session_id: s.sessionId,
      turn: s.turn,
      timestamp: new Date().toISOString(),
      rng_seed: s.rngSeed,
      genre: s.config.genre,
      config: {
        answers_to_Q1_Q25: s.setupAnswers,
        level_cap: s.config.levelCap,
        death_rule: s.config.deathRule,
      },
      toggles: s.toggles,
      PC: s.character,
      location: s.location,
      time: s.world.time,
      inventory: s.character.inventory,
      resources: s.resources,
      known_npcs: s.world.npcs,
      factions: s.world.factions,
      regions: s.world.regions,
      quests: s.world.quests,
      clocks: s.world.clocks,
      flags: s.flags,
      timeline: s.timeline,
      random_log: s.rollLog,
      action_tags: s.actionTags,
      World_Bible: {
        regions_compact: s.world.regions.map((r) => ({
          id: r.id,
          name: r.name,
          summary: r.description.slice(0, 120),
        })),
        species_compact: [],
        factions_compact: s.world.factions.map((f) => ({
          id: f.id,
          name: f.name,
          summary: f.description.slice(0, 120),
        })),
        economy_compact: `${s.config.economyIntensity === 1 ? 'loose' : s.config.economyIntensity === 2 ? 'structured' : 'full sim'} economy`,
        key_npcs_compact: s.world.npcs
          .filter((n) => !n.isMinor)
          .map((n) => ({ id: n.id, name: n.name, summary: n.notes.slice(0, 80) })),
        quest_seeds: s.world.quests.active.map((q) => q.title),
        global_clocks: s.world.clocks.filter((c) => c.active),
        known_secrets_compact: s.world.secrets
          .filter((sec) => sec.discovered)
          .map((sec) => sec.description)
          .join('; '),
      },
      rules_house: {},
      bookmarks: s.bookmarks,
      history_abridged: s.historyAbridged,
    };
  },

  loadFromSaveState(state: SaveState) {
    const rng = createRNG(state.rng_seed);
    // Fast-forward RNG to match saved state (approximately)
    for (let i = 0; i < state.turn; i++) rng.next();

    const world: WorldState = {
      regions: state.regions,
      factions: state.factions,
      npcs: state.known_npcs,
      clocks: state.clocks,
      quests: state.quests,
      economy: {
        nodes: state.regions.map((r) => ({
          regionId: r.id,
          supply: {},
          demand: {},
          priceModifiers: {},
        })),
        globalModifiers: {},
        tradeRoutes: [],
      },
      time: state.time,
      weather: { current: 'clear', severity: 0, duration: 0 },
      secrets: [],
      flags: state.flags as Record<string, unknown>,
    };

    set({
      sessionId: state.session_id,
      rngSeed: state.rng_seed,
      rng,
      turn: state.turn,
      config: {
        genre: state.genre,
        secondGenre: state.config.answers_to_Q1_Q25.q3_secondGenre,
        hasApocalypse: state.config.answers_to_Q1_Q25.q4_apocalypse,
        magicLevel: state.config.answers_to_Q1_Q25.q5_magicLevel,
        techLevel: state.config.answers_to_Q1_Q25.q6_techLevel,
        supernaturalLevel: state.config.answers_to_Q1_Q25.q7_supernaturalLevel,
        grittyTone: state.config.answers_to_Q1_Q25.q8_grittyTone,
        combatLethality: state.config.answers_to_Q1_Q25.q9_combatLethality,
        survivalEnabled: state.config.answers_to_Q1_Q25.q10_survivalEnabled,
        survivalMeters: state.config.answers_to_Q1_Q25.q11_survivalMeters,
        worldScale: state.config.answers_to_Q1_Q25.q12_worldScale,
        majorRegionsCount: state.config.answers_to_Q1_Q25.q13_majorRegions,
        intelligentSpeciesCount: state.config.answers_to_Q1_Q25.q14_intelligentSpecies,
        majorFactionsCount: state.config.answers_to_Q1_Q25.q15_majorFactions,
        randomEventFrequency: state.config.answers_to_Q1_Q25.q16_randomEventFrequency,
        npcComplexity: state.config.answers_to_Q1_Q25.q17_npcComplexity,
        startingPowerLevel: state.config.answers_to_Q1_Q25.q18_startingPowerLevel,
        statBudget: state.config.answers_to_Q1_Q25.q19_statBudget,
        levelCap: state.config.level_cap,
        deathRule: state.config.death_rule,
        hexExploration: state.config.answers_to_Q1_Q25.q22_hexExploration,
        economyIntensity: state.config.answers_to_Q1_Q25.q23_economyIntensity,
        secretDensity: state.config.answers_to_Q1_Q25.q24_secretDensity,
        archetypeTagline: state.config.answers_to_Q1_Q25.q25_archetypeTagline,
      },
      toggles: state.toggles,
      setupAnswers: state.config.answers_to_Q1_Q25,
      character: state.PC,
      world,
      location: state.location,
      timeline: state.timeline,
      rollLog: state.random_log,
      bookmarks: state.bookmarks,
      actionTags: state.action_tags,
      historyAbridged: state.history_abridged,
      resources: state.resources,
      flags: state.flags as Record<string, unknown>,
      messages: [],
      notes: [],
    });
  },

  setHistoryAbridged(text) {
    set({ historyAbridged: text });
  },

  // ─── RNG ──────────────────────────────────────────────────

  getRNG(): RNG {
    let { rng } = get();
    if (!rng) {
      const seed = randomSeed();
      rng = createRNG(seed);
      set({ rng, rngSeed: seed });
    }
    return rng;
  },
}));

// Selector helpers

export const selectCharacter = (s: GameStore) => s.character;
export const selectWorld = (s: GameStore) => s.world;
export const selectConfig = (s: GameStore) => s.config;
export const selectTurn = (s: GameStore) => s.turn;
export const selectMessages = (s: GameStore) => s.messages;
export const selectRollLog = (s: GameStore) => s.rollLog;
export const selectLocation = (s: GameStore) => s.location;
