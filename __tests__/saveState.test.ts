import {
  SaveStateSchema,
  SetupAnswersSchema,
  validateSaveState,
  validateSetupAnswers,
} from '../src/schemas/saveState';
import { MOCK_SAVE_STATE } from '../src/data/mockSession';

const validAnswers = {
  q1_genre: 'fantasy',
  q2_mixSecondGenre: false,
  q3_secondGenre: null,
  q4_apocalypse: false,
  q5_magicLevel: 5,
  q6_techLevel: 3,
  q7_supernaturalLevel: 2,
  q8_grittyTone: false,
  q9_combatLethality: 5,
  q10_survivalEnabled: false,
  q11_survivalMeters: [],
  q12_worldScale: 2,
  q13_majorRegions: 3,
  q14_intelligentSpecies: 2,
  q15_majorFactions: 2,
  q16_randomEventFrequency: 5,
  q17_npcComplexity: 1,
  q18_startingPowerLevel: 5,
  q19_statBudget: 'standard',
  q20_levelCap: 20,
  q21_deathRule: 'respawn',
  q22_hexExploration: false,
  q23_economyIntensity: 1,
  q24_secretDensity: 3,
  q25_archetypeTagline: 'A brave warrior who protects the weak',
};

describe('SetupAnswersSchema', () => {
  test('validates a correct answers object', () => {
    const result = SetupAnswersSchema.safeParse(validAnswers);
    expect(result.success).toBe(true);
  });

  test('rejects invalid genre', () => {
    const bad = { ...validAnswers, q1_genre: 'space-opera' };
    expect(SetupAnswersSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects invalid stat budget', () => {
    const bad = { ...validAnswers, q19_statBudget: 'legendary' };
    expect(SetupAnswersSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects invalid death rule', () => {
    const bad = { ...validAnswers, q21_deathRule: 'instant_death' };
    expect(SetupAnswersSchema.safeParse(bad).success).toBe(false);
  });

  test('accepts all 7 valid genres', () => {
    const genres = ['fantasy', 'sci-fi', 'zombie', 'modern', 'cyberpunk', 'historical', 'mixed'];
    for (const genre of genres) {
      const result = SetupAnswersSchema.safeParse({ ...validAnswers, q1_genre: genre });
      expect(result.success).toBe(true);
    }
  });

  test('accepts q3_secondGenre as null', () => {
    expect(SetupAnswersSchema.safeParse({ ...validAnswers, q3_secondGenre: null }).success).toBe(true);
  });

  test('accepts q3_secondGenre as a valid genre', () => {
    expect(SetupAnswersSchema.safeParse({ ...validAnswers, q3_secondGenre: 'cyberpunk' }).success).toBe(true);
  });

  test('rejects missing required field', () => {
    const { q1_genre: _removed, ...rest } = validAnswers;
    expect(SetupAnswersSchema.safeParse(rest).success).toBe(false);
  });
});

describe('SaveStateSchema', () => {
  test('validates the mock save state', () => {
    const result = SaveStateSchema.safeParse(MOCK_SAVE_STATE);
    if (!result.success) {
      console.error('Validation errors:', JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  test('rejects save state with wrong version type', () => {
    const bad = { ...MOCK_SAVE_STATE, turn: 'not-a-number' };
    expect(SaveStateSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects save state missing session_id', () => {
    const { session_id: _removed, ...rest } = MOCK_SAVE_STATE;
    expect(SaveStateSchema.safeParse(rest).success).toBe(false);
  });

  test('rejects save state with negative turn', () => {
    const bad = { ...MOCK_SAVE_STATE, turn: -1 };
    expect(SaveStateSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects save state with invalid rng_seed type', () => {
    const bad = { ...MOCK_SAVE_STATE, rng_seed: 'not-a-number' };
    expect(SaveStateSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects non-UUID session_id', () => {
    const bad = { ...MOCK_SAVE_STATE, session_id: 'not-a-uuid' };
    expect(SaveStateSchema.safeParse(bad).success).toBe(false);
  });
});

describe('validateSaveState', () => {
  test('returns success when valid', () => {
    const result = validateSaveState(MOCK_SAVE_STATE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_id).toBe(MOCK_SAVE_STATE.session_id);
    }
  });

  test('returns failure for garbage input', () => {
    expect(validateSaveState(null).success).toBe(false);
    expect(validateSaveState(undefined).success).toBe(false);
    expect(validateSaveState('not an object').success).toBe(false);
    expect(validateSaveState(42).success).toBe(false);
  });

  test('returns failure for partial input', () => {
    expect(validateSaveState({ turn: 1 }).success).toBe(false);
  });

  test('includes error list on failure', () => {
    const result = validateSaveState({ turn: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.errors)).toBe(true);
    }
  });
});

describe('validateSetupAnswers', () => {
  test('returns success with valid answers', () => {
    const result = validateSetupAnswers(validAnswers);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q1_genre).toBe('fantasy');
    }
  });

  test('returns failure for invalid answers', () => {
    expect(validateSetupAnswers({}).success).toBe(false);
    expect(validateSetupAnswers(null).success).toBe(false);
  });
});
