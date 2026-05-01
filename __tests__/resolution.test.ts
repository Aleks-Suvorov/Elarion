import { createRNG } from '../src/lib/rng';
import { classifyAction, deriveAdvantage, resolveAction } from '../src/engine/resolution';
import { DC } from '../src/engine/dice';
import type { Character, GameConfig } from '../src/types';

const FIXED_SEED = 0xdeadbeef;

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: 'Test',
    species: 'human',
    archetype: 'warrior',
    level: 1,
    xp: 0,
    xpToNext: 110,
    stats: {
      strength: 7,
      agility: 7,
      endurance: 7,
      perception: 7,
      intellect: 7,
      willpower: 7,
      charisma: 7,
      luck: 7,
    },
    tracks: {
      hp: { current: 20, max: 20, label: 'HP' },
      stamina: { current: 15, max: 15, label: 'Stamina' },
    },
    skills: {},
    abilities: [],
    traits: [],
    equipment: {},
    inventory: [],
    reputation: {},
    connections: [],
    backstory: '',
    appearance: '',
    notes: '',
    ...overrides,
  } as Character;
}

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return {
    genre: 'fantasy',
    secondGenre: null,
    hasApocalypse: false,
    magicLevel: 5,
    techLevel: 5,
    supernaturalLevel: 3,
    grittyTone: false,
    combatLethality: 5,
    survivalEnabled: false,
    survivalMeters: [],
    worldScale: 2,
    majorRegionsCount: 3,
    intelligentSpeciesCount: 2,
    majorFactionsCount: 2,
    randomEventFrequency: 5,
    npcComplexity: 1,
    startingPowerLevel: 5,
    statBudget: 'standard',
    levelCap: 20,
    deathRule: 'respawn',
    hexExploration: false,
    economyIntensity: 1,
    secretDensity: 3,
    archetypeTagline: 'A brave warrior',
    ...overrides,
  } as GameConfig;
}

describe('classifyAction', () => {
  test('detects attack keywords', () => {
    const r = classifyAction('I attack the guard', makeConfig());
    expect(r.category).toBe('combat_attack');
  });

  test('detects stealth keywords', () => {
    const r = classifyAction('I sneak past the patrol', makeConfig());
    expect(r.category).toBe('stealth');
  });

  test('detects social keywords', () => {
    const r = classifyAction('I try to persuade the merchant', makeConfig());
    expect(r.category).toBe('social');
  });

  test('detects exploration keywords', () => {
    const r = classifyAction('I search the room for clues', makeConfig());
    expect(r.category).toBe('exploration');
  });

  test('falls back to generic for unknown action', () => {
    const r = classifyAction('I do something completely undefined', makeConfig());
    expect(r.category).toBe('generic');
  });

  test('returns a dc value', () => {
    const r = classifyAction('attack the enemy', makeConfig());
    expect(typeof r.dc).toBe('number');
    expect(r.dc).toBeGreaterThanOrEqual(DC.TRIVIAL);
    expect(r.dc).toBeLessThanOrEqual(DC.IMPOSSIBLE);
  });

  test('returns a stat key', () => {
    const r = classifyAction('attack the enemy', makeConfig());
    expect(typeof r.stat).toBe('string');
  });
});

describe('deriveAdvantage', () => {
  test('returns a valid Advantage value', () => {
    const char = makeCharacter();
    const adv = deriveAdvantage('I attack', char, makeConfig());
    expect(['advantage', 'disadvantage', 'none']).toContain(adv);
  });

  test('advantage when action contains carefully', () => {
    const char = makeCharacter();
    const adv = deriveAdvantage('I carefully sneak past', char, makeConfig());
    expect(adv).toBe('advantage');
  });

  test('disadvantage when action contains recklessly', () => {
    const char = makeCharacter();
    const adv = deriveAdvantage('I recklessly charge', char, makeConfig());
    expect(adv).toBe('disadvantage');
  });

  test('disadvantage when HP is critical', () => {
    const char = makeCharacter({ tracks: { hp: { current: 3, max: 20, label: 'HP' }, stamina: { current: 15, max: 15, label: 'Stamina' } } });
    const adv = deriveAdvantage('I attack', char, makeConfig());
    expect(adv).toBe('disadvantage');
  });
});

describe('resolveAction', () => {
  test('returns a ResolutionOutput', () => {
    const rng = createRNG(FIXED_SEED);
    const char = makeCharacter();
    const config = makeConfig();
    const output = resolveAction({ rng, action: 'I attack the orc', character: char, config, turn: 1 });
    expect(output).toHaveProperty('roll');
    expect(output).toHaveProperty('consequence');
    expect(output).toHaveProperty('xpGained');
    expect(output).toHaveProperty('hpDelta');
  });

  test('consequence is a valid ConsequenceLevel', () => {
    const rng = createRNG(FIXED_SEED);
    const output = resolveAction({
      rng,
      action: 'attack the guard',
      character: makeCharacter(),
      config: makeConfig(),
      turn: 1,
    });
    const validLevels = ['critical_success', 'success', 'partial', 'failure', 'critical_failure'];
    expect(validLevels).toContain(output.consequence);
  });

  test('xpGained is a non-negative number', () => {
    const rng = createRNG(FIXED_SEED);
    const output = resolveAction({
      rng,
      action: 'attack',
      character: makeCharacter(),
      config: makeConfig(),
      turn: 2,
    });
    expect(output.xpGained).toBeGreaterThanOrEqual(0);
  });

  test('deterministic: same seed, same action, same output', () => {
    const char = makeCharacter();
    const config = makeConfig();
    const o1 = resolveAction({ rng: createRNG(FIXED_SEED), action: 'I attack', character: char, config, turn: 1 });
    const o2 = resolveAction({ rng: createRNG(FIXED_SEED), action: 'I attack', character: char, config, turn: 1 });
    expect(o1.roll.kept).toBe(o2.roll.kept);
    expect(o1.roll.success).toBe(o2.roll.success);
  });

  test('high-lethality config increases combat damage delta on average', () => {
    const char = makeCharacter();
    const lowLeth = makeConfig({ combatLethality: 1 });
    const highLeth = makeConfig({ combatLethality: 10 });

    let lowTotal = 0;
    let highTotal = 0;
    for (let i = 0; i < 20; i++) {
      const oLow = resolveAction({ rng: createRNG(i * 100), action: 'I attack', character: char, config: lowLeth, turn: i });
      const oHigh = resolveAction({ rng: createRNG(i * 100), action: 'I attack', character: char, config: highLeth, turn: i });
      lowTotal += Math.abs(oLow.hpDelta);
      highTotal += Math.abs(oHigh.hpDelta);
    }
    expect(highTotal).toBeGreaterThanOrEqual(lowTotal);
  });
});
