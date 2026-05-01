import type { TurnRecord, RollResult, NPC, SaveState } from '../types';
import { rollSummary } from '../engine/dice';

const DEFAULT_KEEP_RECENT = 20;
const DEFAULT_KEEP_ROLLS = 50;
const DEFAULT_MAX_BYTES = 512 * 1024; // 512 KB

// ─── Timeline Compression ─────────────────────────────────────

export function compressTimeline(
  timeline: TurnRecord[],
  keepRecent = DEFAULT_KEEP_RECENT
): { timeline: TurnRecord[]; abridged: string } {
  if (timeline.length <= keepRecent) {
    return { timeline, abridged: '' };
  }

  const old = timeline.slice(0, timeline.length - keepRecent);
  const recent = timeline.slice(timeline.length - keepRecent);

  const chunks: string[] = [];
  const chunkSize = 5;

  for (let i = 0; i < old.length; i += chunkSize) {
    const chunk = old.slice(i, i + chunkSize);
    const startTurn = chunk[0].turn;
    const endTurn = chunk[chunk.length - 1].turn;
    const summaries = chunk.map((r) => {
      const rollStr = r.rollResult ? ` [${rollSummary(r.rollResult)}]` : '';
      return r.action.slice(0, 40) + rollStr;
    });
    chunks.push(`Turns ${startTurn}–${endTurn}: ${summaries.join(' | ')}`);
  }

  return {
    timeline: recent,
    abridged: chunks.join('\n'),
  };
}

// ─── NPC Compression ──────────────────────────────────────────

export function compressNPCs(npcs: NPC[]): NPC[] {
  const major = npcs.filter((n) => !n.isMinor);
  const minor = npcs.filter((n) => n.isMinor);

  const trimmedMinor = minor.slice(0, 20).map((n) => ({
    ...n,
    notes: n.notes.slice(0, 50),
    backstory: undefined,
    stats: undefined,
  }));

  return [...major, ...trimmedMinor];
}

// ─── Roll Log Compression ─────────────────────────────────────

export function compressRollLog(
  log: RollResult[],
  keep = DEFAULT_KEEP_ROLLS
): RollResult[] {
  return log.slice(0, keep);
}

// ─── Handoff Generator ────────────────────────────────────────

export function generateHandoff(state: SaveState): string {
  const { PC, location, quests, clocks, timeline, config, turn, session_id, genre } = state;

  const hpStr = `${PC.tracks.hp.current}/${PC.tracks.hp.max} HP`;
  const recentActions = timeline.slice(-5).map(
    (r) => `  Turn ${r.turn}: ${r.action.slice(0, 60)}`
  );

  const urgentClocks = clocks
    .filter((c) => c.active)
    .sort((a, b) => (a.maxTicks - a.ticks) - (b.maxTicks - b.ticks))
    .slice(0, 3)
    .map((c) => `  [${c.ticks}/${c.maxTicks}] ${c.name}`);

  const activeQuests = quests.active.slice(0, 3).map((q) => `  ◎ ${q.title}`);
  const levelCapStr = config.level_cap === 'limitless' ? 'Limitless' : `Cap Lv${config.level_cap}`;

  const lines = [
    `=== USRE HANDOFF — Turn ${turn} ===`,
    `Session: ${session_id.slice(0, 8)}... | Genre: ${genre} | ${levelCapStr}`,
    '',
    `PC: ${PC.name} — ${PC.archetype} (Lv ${PC.level}) | ${hpStr} | ${PC.species}`,
    `Location: ${location.regionName}${location.subLocation ? ' / ' + location.subLocation : ''}`,
    `Tagline: ${config.answers_to_Q1_Q25.q25_archetypeTagline}`,
    '',
    'RECENT ACTIONS:',
    ...recentActions,
    '',
    'ACTIVE CLOCKS:',
    ...(urgentClocks.length ? urgentClocks : ['  None']),
    '',
    'ACTIVE QUESTS:',
    ...(activeQuests.length ? activeQuests : ['  None']),
    '',
    `TONE: ${config.answers_to_Q1_Q25.q8_grittyTone ? 'Gritty-realistic' : 'Genre default'} | Lethality: ${config.answers_to_Q1_Q25.q9_combatLethality}/10`,
    `Death rule: ${config.death_rule}`,
    '=== END HANDOFF ===',
  ];

  return lines.join('\n');
}

// ─── Size Estimation ──────────────────────────────────────────

export function estimateSaveSize(saveState: SaveState): number {
  return JSON.stringify(saveState).length;
}

// ─── Auto Compress ────────────────────────────────────────────

export function autoCompress(
  saveState: SaveState,
  maxBytes = DEFAULT_MAX_BYTES
): SaveState {
  const size = estimateSaveSize(saveState);
  if (size <= maxBytes) return saveState;

  const { timeline, abridged } = compressTimeline(saveState.timeline);
  const known_npcs = compressNPCs(saveState.known_npcs);
  const random_log = compressRollLog(saveState.random_log);

  const compressed: SaveState = {
    ...saveState,
    timeline,
    known_npcs,
    random_log,
    history_abridged: saveState.history_abridged
      ? saveState.history_abridged + '\n' + abridged
      : abridged,
  };

  // If still too large, trim completed quest/clock history
  if (estimateSaveSize(compressed) > maxBytes) {
    return {
      ...compressed,
      quests: {
        ...compressed.quests,
        completed: compressed.quests.completed.slice(-10),
        failed: compressed.quests.failed.slice(-5),
      },
    };
  }

  return compressed;
}
