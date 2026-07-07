import type { RNG } from '../lib/rng';
import type {
  Character,
  GameConfig,
  RollResult,
  Advantage,
  StatKey,
  TurnRecord,
} from '../types';
import { resolveRoll, totalModifier, DC, lethalityDamageScale } from './dice';

// ─── Action Classification ────────────────────────────────────

export type ActionCategory =
  | 'combat_attack'
  | 'combat_defend'
  | 'stealth'
  | 'social'
  | 'exploration'
  | 'survival'
  | 'magic'
  | 'tech'
  | 'crafting'
  | 'knowledge'
  | 'athletic'
  | 'generic';

interface ActionHint {
  category: ActionCategory;
  primaryStat: StatKey;
  baseDC: number;
  keywords: string[];
}

const ACTION_HINTS: ActionHint[] = [
  {
    category: 'combat_attack',
    primaryStat: 'strength',
    baseDC: DC.ROUTINE,
    keywords: ['attack', 'strike', 'hit', 'slash', 'shoot', 'fire', 'stab', 'fight', 'charge', 'assault'],
  },
  {
    category: 'combat_defend',
    primaryStat: 'agility',
    baseDC: DC.ROUTINE,
    keywords: ['dodge', 'parry', 'block', 'evade', 'defend', 'shield'],
  },
  {
    category: 'stealth',
    primaryStat: 'agility',
    baseDC: DC.TOUGH,
    keywords: ['sneak', 'hide', 'steal', 'pickpocket', 'skulk', 'shadow', 'ambush'],
  },
  {
    category: 'social',
    primaryStat: 'charisma',
    baseDC: DC.ROUTINE,
    keywords: ['persuade', 'convince', 'negotiate', 'bribe', 'lie', 'deceive', 'charm', 'intimidate', 'threaten', 'talk', 'ask', 'bargain'],
  },
  {
    category: 'exploration',
    primaryStat: 'perception',
    baseDC: DC.ROUTINE,
    keywords: ['search', 'look', 'investigate', 'find', 'scan', 'inspect', 'examine', 'scout', 'track', 'follow'],
  },
  {
    category: 'survival',
    primaryStat: 'endurance',
    baseDC: DC.ROUTINE,
    keywords: ['forage', 'hunt', 'camp', 'survive', 'endure', 'ration', 'treat', 'heal', 'bandage', 'rest'],
  },
  {
    category: 'magic',
    primaryStat: 'magic',
    baseDC: DC.TOUGH,
    keywords: ['cast', 'spell', 'enchant', 'summon', 'conjure', 'channel', 'invoke', 'ritual', 'hex', 'curse'],
  },
  {
    category: 'tech',
    primaryStat: 'tech',
    baseDC: DC.ROUTINE,
    keywords: ['hack', 'program', 'repair', 'build', 'craft', 'install', 'override', 'bypass', 'decrypt', 'compile'],
  },
  {
    category: 'crafting',
    primaryStat: 'intellect',
    baseDC: DC.ROUTINE,
    keywords: ['craft', 'make', 'create', 'brew', 'smith', 'fabricate', 'construct', 'assemble'],
  },
  {
    category: 'knowledge',
    primaryStat: 'intellect',
    baseDC: DC.ROUTINE,
    keywords: ['recall', 'remember', 'know', 'identify', 'analyse', 'analyze', 'study', 'read', 'decipher'],
  },
  {
    category: 'athletic',
    primaryStat: 'agility',
    baseDC: DC.ROUTINE,
    keywords: ['climb', 'jump', 'run', 'swim', 'sprint', 'leap', 'vault', 'balance', 'dash'],
  },
];

export function classifyAction(
  action: string,
  config: GameConfig
): { category: ActionCategory; stat: StatKey; dc: number } {
  const lower = action.toLowerCase();

  for (const hint of ACTION_HINTS) {
    // Skip magic/tech/psionics if disabled in config
    if (hint.category === 'magic' && config.magicLevel === 0) continue;
    if (hint.category === 'tech' && config.techLevel === 0) continue;

    if (hint.keywords.some((kw) => lower.includes(kw))) {
      // Adjust DC for combat lethality
      let dc = hint.baseDC;
      if (
        hint.category === 'combat_attack' ||
        hint.category === 'combat_defend'
      ) {
        dc = Math.min(DC.IMPOSSIBLE, dc + Math.floor(config.combatLethality / 4));
      }
      return { category: hint.category, stat: hint.primaryStat, dc };
    }
  }

  return { category: 'generic', stat: 'luck', dc: DC.ROUTINE };
}

// ─── Advantage Derivation ─────────────────────────────────────

export function deriveAdvantage(
  action: string,
  character: Character,
  _config: GameConfig
): Advantage {
  const lower = action.toLowerCase();
  // Simple keyword-based advantage hints
  if (lower.includes('carefully') || lower.includes('cautiously')) {
    return 'advantage';
  }
  if (lower.includes('recklessly') || lower.includes('blindly')) {
    return 'disadvantage';
  }
  // Injured penalty
  const hpRatio = character.tracks.hp.current / character.tracks.hp.max;
  if (hpRatio <= 0.25) return 'disadvantage';
  return 'none';
}

// ─── Full Action Resolution ───────────────────────────────────

export interface ResolutionInput {
  action: string;
  character: Character;
  config: GameConfig;
  rng: RNG;
  turn: number;
  forcedDC?: number;
  forcedStat?: StatKey;
  forcedAdvantage?: Advantage;
  situationalModifier?: number;
}

export interface ResolutionOutput {
  roll: RollResult;
  consequence: ConsequenceLevel;
  xpGained: number;
  hpDelta: number;
  staminaDelta: number;
  narrativeHints: string[];
}

export type ConsequenceLevel =
  | 'critical_success'
  | 'success'
  | 'partial'
  | 'failure'
  | 'critical_failure';

export function resolveAction(input: ResolutionInput): ResolutionOutput {
  const { action, character, config, rng, turn } = input;

  const { stat, dc: baseDC, category } = classifyAction(action, config);
  const dc = input.forcedDC ?? baseDC;
  const statKey = input.forcedStat ?? stat;

  const skillBonus =
    statKey in (character.skills ?? {}) ? character.skills[statKey] ?? 0 : 0;
  const mod = totalModifier(
    character.stats,
    statKey,
    skillBonus,
    input.situationalModifier ?? 0
  );

  const advantage =
    input.forcedAdvantage ?? deriveAdvantage(action, character, config);

  const roll = resolveRoll(rng, dc, mod, advantage, turn, statKey);

  const consequence = deriveConsequence(roll, config);
  const xpGained = xpForAction(consequence, dc);
  const isCombat = category === 'combat_attack' || category === 'combat_defend';
  const hpDelta = isCombat ? hpDeltaFromConsequence(consequence, config) : 0;
  const staminaDelta = staminaDelta_(consequence);
  const narrativeHints = buildNarrativeHints(consequence, roll, action, config);

  return { roll, consequence, xpGained, hpDelta, staminaDelta, narrativeHints };
}

function deriveConsequence(
  roll: RollResult,
  _config: GameConfig
): ConsequenceLevel {
  if (roll.isAutoSuccess || (roll.success && roll.isCrit))
    return 'critical_success';
  if (roll.success) return 'success';
  if (!roll.success && roll.isFumble) return 'critical_failure';
  // Partial: failed by 1-2 but not a fumble
  if (!roll.success && roll.total >= roll.dc - 2) return 'partial';
  return 'failure';
}

function xpForAction(level: ConsequenceLevel, dc: number): number {
  const dcBonus = Math.max(0, dc - DC.ROUTINE);
  const base = { critical_success: 4, success: 2, partial: 1, failure: 1, critical_failure: 0 }[level];
  return base + dcBonus;
}

function hpDeltaFromConsequence(level: ConsequenceLevel, config: GameConfig): number {
  const scale = lethalityDamageScale(config.combatLethality);
  const base: Record<ConsequenceLevel, number> = {
    critical_success: 0,
    success: 0,
    partial: -Math.ceil(scale * 2),
    failure: -Math.ceil(scale * 3),
    critical_failure: -Math.ceil(scale * 5),
  };
  return base[level];
}

function staminaDelta_(level: ConsequenceLevel): number {
  return level === 'critical_success' ? 0 : level === 'success' ? -1 : -2;
}

function buildNarrativeHints(
  level: ConsequenceLevel,
  roll: RollResult,
  action: string,
  _config: GameConfig
): string[] {
  const hints: string[] = [];
  const verb = action.split(' ')[0] ?? 'act';

  switch (level) {
    case 'critical_success':
      hints.push(`You ${verb} with exceptional skill — a bonus opportunity presents itself.`);
      break;
    case 'success':
      hints.push(`You ${verb} successfully.`);
      break;
    case 'partial':
      hints.push(`You ${verb}, but not cleanly — there's a complication.`);
      break;
    case 'failure':
      hints.push(`The attempt to ${verb} fails.`);
      break;
    case 'critical_failure':
      hints.push(`A catastrophic failure — the situation worsens sharply.`);
      if (roll.isFumble) hints.push(`The fumble (1) carries extra consequence.`);
      break;
  }

  return hints;
}

// ─── Combat Quick-Resolve ─────────────────────────────────────

export interface Combatant {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  statBlock?: Partial<Character['stats']>;
}

export interface CombatRound {
  attackerRoll: RollResult;
  defenderRoll: RollResult;
  attackerHit: boolean;
  damage: number;
  summary: string;
}

export function resolveCombatRound(
  attacker: Combatant,
  defender: Combatant,
  rng: RNG,
  config: GameConfig,
  turn: number
): CombatRound {
  const attackMod = attacker.attack;
  const defenseDC = DC.ROUTINE + defender.defense;

  const attackerRoll = resolveRoll(rng, defenseDC, attackMod, 'none', turn, 'strength');
  const defenderRoll = resolveRoll(rng, DC.ROUTINE, defender.defense, 'none', turn, 'agility');

  const attackerHit = attackerRoll.success;
  const scale = lethalityDamageScale(config.combatLethality);
  const damage = attackerHit
    ? Math.max(1, Math.ceil(attackerRoll.total * scale * 0.5))
    : 0;

  let summary: string;
  if (attackerRoll.isCrit) {
    summary = `${attacker.name} lands a CRITICAL hit on ${defender.name} for ${damage} damage!`;
  } else if (attackerRoll.isFumble) {
    summary = `${attacker.name} fumbles badly — opening a counterattack!`;
  } else if (attackerHit) {
    summary = `${attacker.name} hits ${defender.name} for ${damage} damage.`;
  } else {
    summary = `${defender.name} avoids ${attacker.name}'s attack.`;
  }

  return { attackerRoll, defenderRoll, attackerHit, damage, summary };
}

// ─── Turn Record Builder ──────────────────────────────────────

export function buildTurnRecord(
  turn: number,
  action: string,
  resolution: ResolutionOutput,
  consequences: string[],
  worldChanges: string[]
): TurnRecord {
  return {
    turn,
    timestamp: Date.now(),
    action,
    result: resolution.narrativeHints[0] ?? '',
    rollResult: resolution.roll,
    consequences,
    worldChanges,
  };
}
