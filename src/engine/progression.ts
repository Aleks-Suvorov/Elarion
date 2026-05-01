import type { Character, RollResult, StatKey, Tracks } from '../types';

// ─── XP Curve ─────────────────────────────────────────────────

export function xpToNextLevel(level: number): number {
  return level * 100 + level * level * 10;
}

// ─── Award XP ─────────────────────────────────────────────────

export function awardXP(
  character: Character,
  xp: number
): { character: Character; leveledUp: boolean; message: string } {
  const newXP = character.xp + xp;
  const threshold = character.xpToNext;

  if (newXP >= threshold) {
    const overflow = newXP - threshold;
    const newLevel = character.level + 1;
    const newThreshold = xpToNextLevel(newLevel);

    const updatedTracks = scaleTracksOnLevelUp(character.tracks, character.level, newLevel);

    return {
      character: {
        ...character,
        level: newLevel,
        xp: overflow,
        xpToNext: newThreshold,
        tracks: updatedTracks,
      },
      leveledUp: true,
      message: `Level Up! ${character.name} is now level ${newLevel}. (+${xp} XP)`,
    };
  }

  return {
    character: { ...character, xp: newXP },
    leveledUp: false,
    message: `+${xp} XP (${newXP}/${threshold})`,
  };
}

function scaleTracksOnLevelUp(tracks: Tracks, _oldLevel: number, _newLevel: number): Tracks {
  // Restore to max on level up as a reward
  return {
    ...tracks,
    hp: { ...tracks.hp, current: tracks.hp.max + 2, max: tracks.hp.max + 2 },
    stamina: { ...tracks.stamina, current: tracks.stamina.max + 1, max: tracks.stamina.max + 1 },
  };
}

// ─── Milestone Perks ──────────────────────────────────────────

const MILESTONE_PERKS: Record<number, string[]> = {
  5: [
    'Iron Will: +1 to all Willpower checks.',
    'Veteran Instinct: First attack each combat has advantage.',
    'Quick Study: Gain +1 rank in any one skill.',
  ],
  10: [
    'Hardened: Reduce incoming damage by 2.',
    'Master Tactician: Advantage on initiative rolls.',
    'Aura of Competence: Allies within sight gain +1 on morale checks.',
  ],
  15: [
    'Legendary Resilience: Once per session, survive a lethal blow at 1 HP.',
    'Peak Performance: One stat of choice increases by 1 (max 10).',
    'Network: In any settlement, you can call in one significant favour.',
  ],
  20: [
    'Transcendent: One ability is now unlimited use.',
    'World Renown: Your reputation precedes you — major factions know your name.',
    'Battle Mastery: Critical hits on rolls of 9–10 (not just 10).',
  ],
  25: [
    'Living Legend: Your deeds are spoken of across the world.',
    'Apex: Choose a mastery — combat, social, or arcane. Gain a unique powerful ability.',
  ],
};

export function milestonePerks(level: number): string[] {
  // Return perks for the highest milestone reached that is also a multiple of 5
  const milestone = Math.floor(level / 5) * 5;
  return MILESTONE_PERKS[milestone] ?? [];
}

// ─── XP Breakdown ─────────────────────────────────────────────

export function xpBreakdown(
  actions: string[],
  rolls: RollResult[]
): { total: number; breakdown: string } {
  const actionXP = actions.length * 2;
  const successXP = rolls.filter((r) => r.success).length * 1;
  const critXP = rolls.filter((r) => r.isCrit).length * 2;
  const dcBonus = rolls.reduce(
    (sum, r) => sum + Math.max(0, r.dc - 5),
    0
  );

  const total = actionXP + successXP + critXP + dcBonus;

  const lines = [
    `${actions.length} actions × 2 = ${actionXP} XP`,
    `${rolls.filter((r) => r.success).length} successes × 1 = ${successXP} XP`,
  ];
  if (critXP > 0) lines.push(`${rolls.filter((r) => r.isCrit).length} crits × 2 = ${critXP} XP`);
  if (dcBonus > 0) lines.push(`High-DC bonus = ${dcBonus} XP`);
  lines.push(`Total: ${total} XP`);

  return { total, breakdown: lines.join('\n') };
}

// ─── Stat Improvements ────────────────────────────────────────

export function statImprovementsAvailable(level: number): number {
  return Math.floor(level / 3);
}

export function applyLevelUp(character: Character, statToIncrease: StatKey): Character {
  const currentVal = character.stats[statToIncrease] ?? 1;
  if (currentVal >= 10) {
    return character; // already at cap
  }

  const newStats = {
    ...character.stats,
    [statToIncrease]: currentVal + 1,
  };

  // Recalculate HP if endurance increased
  let newTracks = { ...character.tracks };
  if (statToIncrease === 'endurance') {
    newTracks = {
      ...newTracks,
      hp: {
        ...newTracks.hp,
        max: newTracks.hp.max + 3,
        current: newTracks.hp.current + 3,
      },
    };
  }

  return {
    ...character,
    stats: newStats,
    tracks: newTracks,
  };
}
