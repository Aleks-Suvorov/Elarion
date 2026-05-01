import type { SetupQuestion, Genre, SurvivalMeter, SetupAnswers } from '../types';

// ─── Validators ───────────────────────────────────────────────

const GENRES: Genre[] = [
  'fantasy',
  'sci-fi',
  'zombie',
  'modern',
  'cyberpunk',
  'historical',
  'mixed',
];

const SURVIVAL_METER_MAP: Record<string, SurvivalMeter> = {
  '1': 'hunger',
  '2': 'thirst',
  '3': 'temperature',
  '4': 'fatigue',
  '5': 'radiation',
  '6': 'disease',
};

function yn(input: string): { valid: boolean; value?: boolean; error?: string } {
  const s = input.trim().toLowerCase();
  if (s === 'y' || s === 'yes') return { valid: true, value: true };
  if (s === 'n' || s === 'no') return { valid: true, value: false };
  return { valid: false, error: 'Answer Y or N.' };
}

function intRange(
  input: string,
  min: number,
  max: number
): { valid: boolean; value?: number; error?: string } {
  const n = parseInt(input.trim(), 10);
  if (isNaN(n)) return { valid: false, error: `Enter a number between ${min} and ${max}.` };
  if (n < min || n > max)
    return { valid: false, error: `Must be between ${min} and ${max}. Got: ${n}` };
  return { valid: true, value: n };
}

// ─── Setup Questions Q1–Q25 ───────────────────────────────────

export const SETUP_QUESTIONS: SetupQuestion[] = [
  // Q1
  {
    id: 'q1_genre',
    number: 1,
    prompt: '[1/25] Primary genre?',
    hint: 'fantasy / sci-fi / zombie / modern / cyberpunk / historical / mixed',
    type: 'genre',
    options: GENRES,
    validate(input) {
      const g = input.trim().toLowerCase();
      if ((GENRES as string[]).includes(g)) return { valid: true, value: g as Genre };
      return { valid: false, error: `Choose: ${GENRES.join(' / ')}` };
    },
  },

  // Q2
  {
    id: 'q2_mixSecondGenre',
    number: 2,
    prompt: '[2/25] Mix a second genre?',
    hint: 'Y / N',
    type: 'yesno',
    defaultValue: false,
    validate: yn,
  },

  // Q3
  {
    id: 'q3_secondGenre',
    number: 3,
    prompt: '[3/25] Second genre? (type the genre, or 0 to skip)',
    hint: 'fantasy / sci-fi / zombie / modern / cyberpunk / historical / mixed / 0',
    type: 'optional_genre',
    options: [...GENRES, '0'],
    validate(input, answers) {
      if (!answers.q2_mixSecondGenre) return { valid: true, value: null };
      const g = input.trim().toLowerCase();
      if (g === '0') return { valid: true, value: null };
      if ((GENRES as string[]).includes(g)) {
        if (g === answers.q1_genre) {
          return { valid: false, error: 'Second genre must differ from primary.' };
        }
        return { valid: true, value: g as Genre };
      }
      return { valid: false, error: `Choose: ${GENRES.join(' / ')} or 0` };
    },
  },

  // Q4
  {
    id: 'q4_apocalypse',
    number: 4,
    prompt: '[4/25] Apocalypse elements present?',
    hint: 'Y / N',
    type: 'yesno',
    defaultValue: false,
    validate: yn,
  },

  // Q5
  {
    id: 'q5_magicLevel',
    number: 5,
    prompt: '[5/25] Magic power level? (0 = none, 10 = pervasive)',
    hint: '0–10',
    type: 'number',
    min: 0,
    max: 10,
    defaultValue: 0,
    validate(input) {
      return intRange(input, 0, 10);
    },
  },

  // Q6
  {
    id: 'q6_techLevel',
    number: 6,
    prompt: '[6/25] Technology level? (0 = primitive, 10 = ultra-advanced)',
    hint: '0–10',
    type: 'number',
    min: 0,
    max: 10,
    defaultValue: 5,
    validate(input) {
      return intRange(input, 0, 10);
    },
  },

  // Q7
  {
    id: 'q7_supernaturalLevel',
    number: 7,
    prompt: '[7/25] Supernatural / Psionics level? (0 = none)',
    hint: '0–10',
    type: 'number',
    min: 0,
    max: 10,
    defaultValue: 0,
    validate(input) {
      return intRange(input, 0, 10);
    },
  },

  // Q8
  {
    id: 'q8_grittyTone',
    number: 8,
    prompt: '[8/25] Override tone to gritty-realistic? (default mirrors genre)',
    hint: 'Y / N',
    type: 'yesno',
    defaultValue: false,
    validate: yn,
  },

  // Q9
  {
    id: 'q9_combatLethality',
    number: 9,
    prompt: '[9/25] Combat lethality? (1 = forgiving, 10 = one-shot territory)',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 5,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q10
  {
    id: 'q10_survivalEnabled',
    number: 10,
    prompt: '[10/25] Enable survival meters? (hunger, thirst, etc.)',
    hint: 'Y / N  (default Y)',
    type: 'yesno',
    defaultValue: true,
    validate: yn,
  },

  // Q11
  {
    id: 'q11_survivalMeters',
    number: 11,
    prompt: '[11/25] Which survival meters? Enter digits (e.g. 1235)',
    hint: '1 Hunger  2 Thirst  3 Temp  4 Fatigue  5 Radiation  6 Disease  (or 0 for all)',
    type: 'meters',
    validate(input, answers) {
      if (!answers.q10_survivalEnabled) return { valid: true, value: [] };
      const s = input.trim();
      if (s === '0') {
        return { valid: true, value: Object.values(SURVIVAL_METER_MAP) };
      }
      const meters: SurvivalMeter[] = [];
      for (const ch of s) {
        if (ch in SURVIVAL_METER_MAP) {
          const m = SURVIVAL_METER_MAP[ch];
          if (!meters.includes(m)) meters.push(m);
        }
      }
      if (meters.length === 0) {
        return { valid: false, error: 'Enter digit(s) 1-6 or 0 for all.' };
      }
      return { valid: true, value: meters };
    },
  },

  // Q12
  {
    id: 'q12_worldScale',
    number: 12,
    prompt: '[12/25] World scale?',
    hint: '1 Village  2 City  3 Region  4 Continent  5 World',
    type: 'choice',
    options: ['1', '2', '3', '4', '5'],
    min: 1,
    max: 5,
    defaultValue: 3,
    validate(input) {
      return intRange(input, 1, 5);
    },
  },

  // Q13
  {
    id: 'q13_majorRegions',
    number: 13,
    prompt: '[13/25] Number of major regions to generate? (1–10)',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 4,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q14
  {
    id: 'q14_intelligentSpecies',
    number: 14,
    prompt: '[14/25] Number of intelligent species?',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 3,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q15
  {
    id: 'q15_majorFactions',
    number: 15,
    prompt: '[15/25] Number of major factions?',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 3,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q16
  {
    id: 'q16_randomEventFrequency',
    number: 16,
    prompt: '[16/25] Random event frequency? (0 = minimal, 10 = constant)',
    hint: '0–10  (adaptive baseline)',
    type: 'number',
    min: 0,
    max: 10,
    defaultValue: 4,
    validate(input) {
      return intRange(input, 0, 10);
    },
  },

  // Q17
  {
    id: 'q17_npcComplexity',
    number: 17,
    prompt: '[17/25] NPC complexity? (depth of stat modeling / behaviour)',
    hint: '1 Minimal  2 Light  3 Moderate  4 Deep  5 Full simulation',
    type: 'number',
    min: 1,
    max: 5,
    defaultValue: 3,
    validate(input) {
      return intRange(input, 1, 5);
    },
  },

  // Q18
  {
    id: 'q18_startingPowerLevel',
    number: 18,
    prompt: '[18/25] Starting PC power level? (1 = gutter rat, 10 = demigod)',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 3,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q19
  {
    id: 'q19_statBudget',
    number: 19,
    prompt: '[19/25] Stat allocation budget?',
    hint: '1 Standard (35pts)  2 Hard (28pts)  3 Heroic (42pts)',
    type: 'choice',
    options: ['1', '2', '3'],
    validate(input) {
      const v = intRange(input, 1, 3);
      if (!v.valid) return v;
      const map: Record<number, 'standard' | 'hard' | 'heroic'> = {
        1: 'standard',
        2: 'hard',
        3: 'heroic',
      };
      return { valid: true, value: map[v.value as number] };
    },
  },

  // Q20
  {
    id: 'q20_levelCap',
    number: 20,
    prompt: '[20/25] Level cap? (enter a number or "limitless")',
    hint: 'e.g. 20 / 50 / limitless',
    type: 'text',
    validate(input) {
      const s = input.trim().toLowerCase();
      if (s === 'limitless') return { valid: true, value: 'limitless' };
      const n = parseInt(s, 10);
      if (isNaN(n) || n < 1)
        return { valid: false, error: 'Enter a positive number or "limitless".' };
      return { valid: true, value: n };
    },
  },

  // Q21
  {
    id: 'q21_deathRule',
    number: 21,
    prompt: '[21/25] Death rules?',
    hint: '1 Permadeath  2 Respawn  3 Reincarnate  4 New char same world',
    type: 'choice',
    options: ['1', '2', '3', '4'],
    validate(input) {
      const v = intRange(input, 1, 4);
      if (!v.valid) return v;
      const map: Record<
        number,
        'permadeath' | 'respawn' | 'reincarnate' | 'new_char_same_world'
      > = {
        1: 'permadeath',
        2: 'respawn',
        3: 'reincarnate',
        4: 'new_char_same_world',
      };
      return { valid: true, value: map[v.value as number] };
    },
  },

  // Q22
  {
    id: 'q22_hexExploration',
    number: 22,
    prompt: '[22/25] Enable hex / overland exploration layer?',
    hint: 'Y / N',
    type: 'yesno',
    defaultValue: false,
    validate: yn,
  },

  // Q23
  {
    id: 'q23_economyIntensity',
    number: 23,
    prompt: '[23/25] Economy intensity?',
    hint: '1 Loose (hand-waved)  2 Structured (prices matter)  3 Full simulation',
    type: 'choice',
    options: ['1', '2', '3'],
    validate(input) {
      const v = intRange(input, 1, 3);
      if (!v.valid) return v;
      return { valid: true, value: v.value as 1 | 2 | 3 };
    },
  },

  // Q24
  {
    id: 'q24_secretDensity',
    number: 24,
    prompt: '[24/25] Hidden secret density? (1 = sparse, 10 = everywhere)',
    hint: '1–10',
    type: 'number',
    min: 1,
    max: 10,
    defaultValue: 4,
    validate(input) {
      return intRange(input, 1, 10);
    },
  },

  // Q25
  {
    id: 'q25_archetypeTagline',
    number: 25,
    prompt: '[25/25] PC archetype tagline? (2–4 words)',
    hint: 'e.g. "rogue street surgeon"  "exiled dwarven engineer"  "psychic bounty hunter"',
    type: 'text',
    validate(input) {
      const s = input.trim();
      if (s.length < 2) return { valid: false, error: 'Too short. Describe your character in 2–4 words.' };
      if (s.length > 60) return { valid: false, error: 'Too long. Keep it under 60 characters.' };
      return { valid: true, value: s };
    },
  },
];

// ─── Setup Summary Builder ────────────────────────────────────

export function buildSetupSummary(answers: SetupAnswers): string {
  const genre2 = answers.q3_secondGenre ? ` + ${answers.q3_secondGenre}` : '';
  const apoc = answers.q4_apocalypse ? ' | apocalyptic' : '';
  const meters =
    answers.q10_survivalEnabled && answers.q11_survivalMeters.length
      ? answers.q11_survivalMeters.join(', ')
      : 'none';

  const budgetMap = { standard: '35pt', hard: '28pt', heroic: '42pt' };
  const deathMap = {
    permadeath: 'permadeath',
    respawn: 'respawn',
    reincarnate: 'reincarnate',
    new_char_same_world: 'new char / same world',
  };
  const ecoMap = { 1: 'loose', 2: 'structured', 3: 'full sim' };
  const scaleMap = {
    1: 'village',
    2: 'city',
    3: 'region',
    4: 'continent',
    5: 'world',
  };

  return [
    `Genre: ${answers.q1_genre}${genre2}${apoc}`,
    `Tone: ${answers.q8_grittyTone ? 'gritty-realistic' : 'genre default'}  |  Lethality: ${answers.q9_combatLethality}/10`,
    `Magic: ${answers.q5_magicLevel}/10  Tech: ${answers.q6_techLevel}/10  Psi: ${answers.q7_supernaturalLevel}/10`,
    `Scale: ${scaleMap[answers.q12_worldScale as keyof typeof scaleMap]}  |  Regions: ${answers.q13_majorRegions}  Factions: ${answers.q15_majorFactions}  Species: ${answers.q14_intelligentSpecies}`,
    `Survival: ${meters}`,
    `Power: ${answers.q18_startingPowerLevel}/10  |  Budget: ${budgetMap[answers.q19_statBudget]}  |  Cap: ${answers.q20_levelCap}`,
    `Death: ${deathMap[answers.q21_deathRule]}  |  Hex: ${answers.q22_hexExploration ? 'yes' : 'no'}  |  Economy: ${ecoMap[answers.q23_economyIntensity]}`,
    `Secrets: ${answers.q24_secretDensity}/10  |  Events: ${answers.q16_randomEventFrequency}/10  |  NPC depth: ${answers.q17_npcComplexity}/5`,
    `Archetype: ${answers.q25_archetypeTagline}`,
  ].join('\n');
}
