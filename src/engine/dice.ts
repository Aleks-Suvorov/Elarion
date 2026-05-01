import type { RNG } from '../lib/rng';
import type { RollResult, Advantage, StatKey, Stats } from '../types';

// ─── DC Constants ─────────────────────────────────────────────

export const DC = {
  TRIVIAL: 3,
  ROUTINE: 5,
  TOUGH: 7,
  EXTREME: 9,
  IMPOSSIBLE: 10,
} as const;

export type DCLevel = keyof typeof DC;

export const AUTO_SUCCESS_THRESHOLD = 2;

// ─── Stat → Modifier ─────────────────────────────────────────
// Stats are 1–10. Modifiers are conservative (+0 to +2 range).
// 1–3 → -1, 4–6 → +0, 7–8 → +1, 9–10 → +2

export function statMod(value: number): number {
  if (value <= 3) return -1;
  if (value <= 6) return 0;
  if (value <= 8) return 1;
  return 2;
}

/** Compute total modifier from stat + skill + situational */
export function totalModifier(
  stats: Stats,
  statKey: StatKey,
  skillBonus = 0,
  situational = 0
): number {
  const base = stats[statKey] ?? 5;
  return statMod(base) + skillBonus + situational;
}

// ─── Core Roll ────────────────────────────────────────────────

export function rollOnce(rng: RNG): number {
  return rng.nextD10();
}

export function resolveRoll(
  rng: RNG,
  dc: number,
  modifier: number,
  advantage: Advantage,
  turn: number,
  statKey?: StatKey,
  skillKey?: string
): RollResult {
  // Auto-success when conditions make roll trivially easy
  if (dc <= AUTO_SUCCESS_THRESHOLD && modifier >= 0) {
    return {
      dice: [],
      kept: dc,
      modifier,
      total: dc,
      dc,
      success: true,
      isCrit: false,
      isFumble: false,
      isAutoSuccess: true,
      advantage: 'none',
      statUsed: statKey,
      skillUsed: skillKey,
      breakdown: `Auto-success (DC≤${AUTO_SUCCESS_THRESHOLD})`,
      timestamp: Date.now(),
      turn,
    };
  }

  // Roll dice based on advantage/disadvantage
  const dice: number[] =
    advantage === 'none'
      ? [rollOnce(rng)]
      : [rollOnce(rng), rollOnce(rng)];

  const kept =
    advantage === 'advantage'
      ? Math.max(...dice)
      : advantage === 'disadvantage'
      ? Math.min(...dice)
      : dice[0];

  const total = kept + modifier;
  const success = total >= dc;
  const isCrit = kept === 10;
  const isFumble = kept === 1;

  // Build breakdown string
  let diceStr: string;
  if (dice.length === 1) {
    diceStr = `${dice[0]}`;
  } else {
    const kept_label = advantage === 'advantage' ? 'keep high' : 'keep low';
    diceStr = `[${dice.join(', ')}] ${kept_label} → ${kept}`;
  }

  const modStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
  const totalStr = modifier !== 0 ? ` = ${total}` : '';
  const dcStr = `vs DC ${dc}`;
  const outcomeStr = success ? '✓' : '✗';
  const critStr = isCrit ? ' [CRIT!]' : isFumble ? ' [FUMBLE]' : '';
  const statStr = statKey ? ` (${statKey})` : '';

  const breakdown = `${diceStr}${modStr}${totalStr} ${dcStr} ${outcomeStr}${critStr}${statStr}`;

  return {
    dice,
    kept,
    modifier,
    total,
    dc,
    success,
    isCrit,
    isFumble,
    isAutoSuccess: false,
    advantage,
    statUsed: statKey,
    skillUsed: skillKey,
    breakdown,
    timestamp: Date.now(),
    turn,
  };
}

// ─── Formatted Output ─────────────────────────────────────────

export function formatRoll(r: RollResult): string {
  return r.breakdown;
}

export function formatRollVerbose(r: RollResult): string {
  if (r.isAutoSuccess) {
    return `⚡ AUTO-SUCCESS — ${r.breakdown}`;
  }
  const icon = r.success ? '✅' : '❌';
  const extra = r.isCrit
    ? '\n🎯 Critical! A bonus effect applies.'
    : r.isFumble
    ? '\n💀 Fumble! An extra consequence applies.'
    : '';
  return `${icon} ${r.breakdown}${extra}`;
}

/** Summarise a roll in <= 1 line for compact history */
export function rollSummary(r: RollResult): string {
  if (r.isAutoSuccess) return `auto-✓`;
  const mark = r.success ? '✓' : '✗';
  return `d10: ${r.kept}${r.modifier !== 0 ? `${r.modifier >= 0 ? '+' : ''}${r.modifier}` : ''}=${r.total} vs DC${r.dc} ${mark}${r.isCrit ? ' CRIT' : r.isFumble ? ' FUMB' : ''}`;
}

// ─── DC Suggestion ────────────────────────────────────────────

export function suggestDC(
  description: string,
  combatLethality: number
): number {
  const d = description.toLowerCase();
  if (d.includes('trivial') || d.includes('easy')) return DC.TRIVIAL;
  if (d.includes('extreme') || d.includes('nearly impossible'))
    return Math.min(DC.IMPOSSIBLE, DC.EXTREME + Math.floor(combatLethality / 4));
  if (d.includes('hard') || d.includes('difficult') || d.includes('tough'))
    return DC.TOUGH;
  if (d.includes('impossible') || d.includes('legendary'))
    return DC.IMPOSSIBLE;
  return DC.ROUTINE;
}

// ─── Lethality Helpers ────────────────────────────────────────

/** Returns max HP damage multiplier based on lethality setting (1–10) */
export function lethalityDamageScale(lethality: number): number {
  return 0.5 + lethality * 0.15;
}
