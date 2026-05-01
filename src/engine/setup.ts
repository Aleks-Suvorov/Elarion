// ============================================================
// USRE — Ultimate Sandbox RPG Engine
// Setup Phase Orchestrator
// ============================================================

import type {
  SetupAnswers,
  GameConfig,
  GameToggles,
  StatBudget,
} from '../types';

// ─── configFromAnswers ────────────────────────────────────────

/**
 * Convert SetupAnswers (q1..q25) into a structured GameConfig.
 */
export function configFromAnswers(answers: SetupAnswers): GameConfig {
  return {
    genre: answers.q1_genre,
    secondGenre: answers.q2_mixSecondGenre ? answers.q3_secondGenre : null,
    hasApocalypse: answers.q4_apocalypse,
    magicLevel: answers.q5_magicLevel,
    techLevel: answers.q6_techLevel,
    supernaturalLevel: answers.q7_supernaturalLevel,
    grittyTone: answers.q8_grittyTone,
    combatLethality: answers.q9_combatLethality,
    survivalEnabled: answers.q10_survivalEnabled,
    survivalMeters: answers.q11_survivalMeters,
    worldScale: answers.q12_worldScale,
    majorRegionsCount: answers.q13_majorRegions,
    intelligentSpeciesCount: answers.q14_intelligentSpecies,
    majorFactionsCount: answers.q15_majorFactions,
    randomEventFrequency: answers.q16_randomEventFrequency,
    npcComplexity: answers.q17_npcComplexity,
    startingPowerLevel: answers.q18_startingPowerLevel,
    statBudget: answers.q19_statBudget,
    levelCap: answers.q20_levelCap,
    deathRule: answers.q21_deathRule,
    hexExploration: answers.q22_hexExploration,
    economyIntensity: answers.q23_economyIntensity,
    secretDensity: answers.q24_secretDensity,
    archetypeTagline: answers.q25_archetypeTagline,
  };
}

// ─── togglesFromConfig ────────────────────────────────────────

/**
 * Derive GameToggles from a GameConfig.
 * crafting is enabled when techLevel > 3.
 */
export function togglesFromConfig(config: GameConfig): GameToggles {
  return {
    survival: config.survivalEnabled,
    crafting: config.techLevel > 3,
    stealth: true,
    social: true,
    magic: config.magicLevel,
    tech: config.techLevel,
    psionics: config.supernaturalLevel,
    hex: config.hexExploration,
  };
}

// ─── statBudgetPoints ────────────────────────────────────────

/**
 * Return the base point pool for the chosen budget mode.
 * standard = 35, hard = 28, heroic = 42.
 */
export function statBudgetPoints(budget: StatBudget): number {
  switch (budget) {
    case 'standard':
      return 35;
    case 'hard':
      return 28;
    case 'heroic':
      return 42;
  }
}

// ─── levelCapLabel ────────────────────────────────────────────

/**
 * Human-readable label for the level cap setting.
 */
export function levelCapLabel(cap: number | 'limitless'): string {
  if (cap === 'limitless') return 'Limitless (no cap)';
  return `Level ${cap} cap`;
}

// ─── adjustedStatBudget ───────────────────────────────────────

/**
 * Apply power-level scaling to the base budget.
 * Power level 1–10 adds 0–13.5 (floored) additional points.
 * Formula: base + floor((powerLevel - 1) * 1.5)
 */
export function adjustedStatBudget(
  budget: StatBudget,
  powerLevel: number
): number {
  const base = statBudgetPoints(budget);
  const bonus = Math.floor((powerLevel - 1) * 1.5);
  return base + bonus;
}
