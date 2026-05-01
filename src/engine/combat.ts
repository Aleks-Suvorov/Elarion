import type { Character, NPC, GameConfig, RollResult } from '../types';
import type { RNG } from '../lib/rng';
import { resolveRoll, DC, statMod, lethalityDamageScale } from './dice';

// ─── Types ────────────────────────────────────────────────────

export interface CombatantState {
  id: string;
  name: string;
  isPlayer: boolean;
  hp: number;
  maxHp: number;
  initiative: number;
  attackMod: number;
  defenseMod: number;
  alive: boolean;
  tags: string[];
}

export interface CombatState {
  round: number;
  phase: 'player_action' | 'enemy_action' | 'resolution' | 'ended';
  combatants: CombatantState[];
  log: string[];
  ended: boolean;
  outcome?: 'victory' | 'defeat' | 'retreat';
}

// ─── NPC → Combatant ──────────────────────────────────────────

export function npcToCombatant(npc: NPC, config: GameConfig, rng: RNG): CombatantState {
  const str = npc.stats?.strength ?? rng.nextInt(3, 6);
  const agi = npc.stats?.agility ?? rng.nextInt(3, 6);
  const end = npc.stats?.endurance ?? rng.nextInt(3, 6);

  const scale = lethalityDamageScale(config.combatLethality);
  const maxHp = Math.ceil((end * 3 + 10) * scale);

  return {
    id: npc.id,
    name: npc.name,
    isPlayer: false,
    hp: maxHp,
    maxHp,
    initiative: rng.nextInt(1, 10) + statMod(agi),
    attackMod: statMod(str),
    defenseMod: statMod(agi),
    alive: true,
    tags: npc.tags,
  };
}

// ─── Init Combat ──────────────────────────────────────────────

export function initCombat(
  character: Character,
  enemies: NPC[],
  config: GameConfig,
  rng: RNG
): CombatState {
  const playerInitiative = rng.nextInt(1, 10) + statMod(character.stats.agility ?? 5);
  const playerCombatant: CombatantState = {
    id: 'player',
    name: character.name,
    isPlayer: true,
    hp: character.tracks.hp.current,
    maxHp: character.tracks.hp.max,
    initiative: playerInitiative,
    attackMod: statMod(character.stats.strength ?? 5),
    defenseMod: statMod(character.stats.agility ?? 5),
    alive: true,
    tags: ['player'],
  };

  const enemyCombatants = enemies.map((e) => npcToCombatant(e, config, rng));

  const combatants = [playerCombatant, ...enemyCombatants].sort(
    (a, b) => b.initiative - a.initiative
  );

  const initLog = [
    `⚔ Combat begins! ${enemies.length} ${enemies.length === 1 ? 'enemy' : 'enemies'}.`,
    ...combatants.map((c) => `  Init ${c.initiative}: ${c.name}`),
  ];

  return {
    round: 1,
    phase: 'player_action',
    combatants,
    log: initLog,
    ended: false,
  };
}

// ─── Player Attack ────────────────────────────────────────────

export function playerAttack(
  state: CombatState,
  targetId: string,
  character: Character,
  config: GameConfig,
  rng: RNG,
  turn: number
): { state: CombatState; roll: RollResult; summary: string } {
  const target = state.combatants.find((c) => c.id === targetId && c.alive);
  if (!target) {
    const noTarget: RollResult = {
      dice: [], kept: 0, modifier: 0, total: 0, dc: 0,
      success: false, isCrit: false, isFumble: false, isAutoSuccess: false,
      advantage: 'none', breakdown: 'Invalid target.', timestamp: Date.now(), turn,
    };
    return { state, roll: noTarget, summary: 'No valid target.' };
  }

  const attackMod = statMod(character.stats.strength ?? 5) +
    (character.skills['Melee Combat'] ?? 0);
  const dc = DC.ROUTINE + target.defenseMod;

  const roll = resolveRoll(rng, dc, attackMod, 'none', turn, 'strength');

  let damage = 0;
  let summary = '';
  const scale = lethalityDamageScale(config.combatLethality);

  if (roll.success) {
    damage = Math.max(1, Math.ceil(roll.total * scale * 0.4));
    if (roll.isCrit) damage = Math.ceil(damage * 1.5);
    summary = roll.isCrit
      ? `CRITICAL HIT on ${target.name} for ${damage} damage!`
      : `${character.name} hits ${target.name} for ${damage} damage.`;
  } else {
    summary = roll.isFumble
      ? `${character.name} fumbles! Opening left for counterattack.`
      : `${character.name} misses ${target.name}.`;
  }

  const updatedCombatants = state.combatants.map((c) => {
    if (c.id !== targetId) return c;
    const newHp = c.hp - damage;
    return { ...c, hp: newHp, alive: newHp > 0 };
  });

  const newState: CombatState = {
    ...state,
    combatants: updatedCombatants,
    phase: 'enemy_action',
    log: [...state.log, `  ${summary}`, `  Roll: ${roll.breakdown}`],
  };

  return { state: checkCombatEnd(newState), roll, summary };
}

// ─── Enemy Actions ────────────────────────────────────────────

export function enemyActions(
  state: CombatState,
  character: Character,
  config: GameConfig,
  rng: RNG,
  turn: number
): { state: CombatState; characterHPDelta: number; log: string[] } {
  const enemies = state.combatants.filter((c) => !c.isPlayer && c.alive);
  const actionLog: string[] = [];
  let totalDelta = 0;
  const scale = lethalityDamageScale(config.combatLethality);

  for (const enemy of enemies) {
    const dc = DC.ROUTINE + statMod(character.stats.agility ?? 5);
    const roll = resolveRoll(rng, dc, enemy.attackMod, 'none', turn, 'agility');

    if (roll.success) {
      const damage = Math.max(1, Math.ceil(roll.total * scale * 0.35));
      totalDelta -= damage;
      const entry = roll.isCrit
        ? `CRITICAL: ${enemy.name} tears through your defenses for ${damage} damage!`
        : `${enemy.name} strikes for ${damage} damage.`;
      actionLog.push(`  ${entry}`);
    } else {
      actionLog.push(`  ${enemy.name} misses.`);
    }
  }

  const newState: CombatState = {
    ...state,
    round: state.round + 1,
    phase: 'player_action',
    log: [...state.log, ...actionLog],
  };

  return {
    state: checkCombatEnd(newState),
    characterHPDelta: totalDelta,
    log: actionLog,
  };
}

// ─── End Check ────────────────────────────────────────────────

export function checkCombatEnd(state: CombatState): CombatState {
  const allEnemiesDead = state.combatants
    .filter((c) => !c.isPlayer)
    .every((c) => !c.alive);

  const playerDead = state.combatants.find((c) => c.isPlayer)?.alive === false;

  if (allEnemiesDead) {
    return {
      ...state,
      ended: true,
      phase: 'ended',
      outcome: 'victory',
      log: [...state.log, '⚔ Victory! All enemies defeated.'],
    };
  }

  if (playerDead) {
    return {
      ...state,
      ended: true,
      phase: 'ended',
      outcome: 'defeat',
      log: [...state.log, '💀 Defeated.'],
    };
  }

  return state;
}

// ─── Display ──────────────────────────────────────────────────

function hpBar(current: number, max: number, width = 8): string {
  const filled = Math.round((current / max) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

export function formatCombatStatus(state: CombatState): string {
  const lines = [`Round ${state.round} | ${state.ended ? `Ended: ${state.outcome ?? ''}` : state.phase}`];
  for (const c of state.combatants) {
    const bar = hpBar(Math.max(0, c.hp), c.maxHp);
    const status = c.alive ? `${c.hp}/${c.maxHp}` : 'DEAD';
    lines.push(`  ${c.isPlayer ? '▶' : '◆'} ${c.name.padEnd(20)} ${bar} ${status}`);
  }
  return lines.join('\n');
}
