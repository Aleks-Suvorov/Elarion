import {
  compressTimeline,
  compressNPCs,
  compressRollLog,
  estimateSaveSize,
  autoCompress,
} from '../src/lib/compression';
import { MOCK_SAVE_STATE } from '../src/data/mockSession';
import { validateSaveState } from '../src/schemas/saveState';
import type { TurnRecord, NPC, RollResult, SaveState } from '../src/types';

// ─── Helpers ─────────────────────────────────────────────────

function makeTurnRecord(turn: number): TurnRecord {
  return {
    turn,
    timestamp: Date.now() + turn * 1000,
    action: `Action taken on turn ${turn}`,
    result: 'Success',
    consequences: [],
    worldChanges: [],
  };
}

function makeNPC(id: string, isMinor: boolean): NPC {
  return {
    id,
    name: `NPC-${id}`,
    species: 'human',
    role: 'guard',
    factionId: null,
    disposition: 0,
    alive: true,
    isMinor,
    lastSeenRegion: 'r-test',
    notes: 'Some notes here',
    tags: [],
  };
}

function makeRollResult(turn: number): RollResult {
  return {
    dice: [5],
    kept: 5,
    modifier: 0,
    total: 5,
    dc: 5,
    success: true,
    isCrit: false,
    isFumble: false,
    isAutoSuccess: false,
    advantage: 'none',
    breakdown: '5 vs DC 5 ✓',
    timestamp: Date.now(),
    turn,
  };
}

// ─── compressTimeline ─────────────────────────────────────────

describe('compressTimeline', () => {
  test('returns unchanged timeline when within keepRecent limit', () => {
    const timeline = Array.from({ length: 10 }, (_, i) => makeTurnRecord(i));
    const { timeline: result, abridged } = compressTimeline(timeline, 20);
    expect(result).toHaveLength(10);
    expect(abridged).toBe('');
  });

  test('compresses when timeline exceeds keepRecent', () => {
    const timeline = Array.from({ length: 30 }, (_, i) => makeTurnRecord(i));
    const { timeline: result, abridged } = compressTimeline(timeline, 20);
    expect(result).toHaveLength(20);
    expect(abridged.length).toBeGreaterThan(0);
  });

  test('keeps the most recent records', () => {
    const timeline = Array.from({ length: 25 }, (_, i) => makeTurnRecord(i));
    const { timeline: result } = compressTimeline(timeline, 20);
    expect(result[0].turn).toBe(5);
    expect(result[result.length - 1].turn).toBe(24);
  });

  test('abridged string contains turn ranges', () => {
    const timeline = Array.from({ length: 30 }, (_, i) => makeTurnRecord(i));
    const { abridged } = compressTimeline(timeline, 20);
    expect(abridged).toMatch(/Turns \d+–\d+/);
  });

  test('exactly at keepRecent boundary does not compress', () => {
    const timeline = Array.from({ length: 20 }, (_, i) => makeTurnRecord(i));
    const { timeline: result, abridged } = compressTimeline(timeline, 20);
    expect(result).toHaveLength(20);
    expect(abridged).toBe('');
  });
});

// ─── compressNPCs ─────────────────────────────────────────────

describe('compressNPCs', () => {
  test('keeps all major NPCs', () => {
    const npcs = [
      makeNPC('m1', false),
      makeNPC('m2', false),
      makeNPC('m3', false),
      ...Array.from({ length: 30 }, (_, i) => makeNPC(`minor-${i}`, true)),
    ];
    const result = compressNPCs(npcs);
    const majorCount = result.filter((n) => !n.isMinor).length;
    expect(majorCount).toBe(3);
  });

  test('trims minor NPCs to 20', () => {
    const npcs = Array.from({ length: 40 }, (_, i) => makeNPC(`minor-${i}`, true));
    const result = compressNPCs(npcs);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  test('preserves major NPCs alongside minor ones', () => {
    const npcs = [makeNPC('maj', false), makeNPC('min', true)];
    const result = compressNPCs(npcs);
    expect(result.some((n) => n.id === 'maj')).toBe(true);
  });
});

// ─── compressRollLog ──────────────────────────────────────────

describe('compressRollLog', () => {
  test('returns full log when under limit', () => {
    const log = Array.from({ length: 30 }, (_, i) => makeRollResult(i));
    const result = compressRollLog(log, 50);
    expect(result).toHaveLength(30);
  });

  test('trims to keep limit', () => {
    const log = Array.from({ length: 80 }, (_, i) => makeRollResult(i));
    const result = compressRollLog(log, 50);
    expect(result).toHaveLength(50);
  });

  test('keeps the first entries', () => {
    const log = Array.from({ length: 10 }, (_, i) => makeRollResult(i));
    const result = compressRollLog(log, 5);
    expect(result[0].turn).toBe(0);
    expect(result[4].turn).toBe(4);
  });
});

// ─── estimateSaveSize ─────────────────────────────────────────

describe('estimateSaveSize', () => {
  test('returns a positive number', () => {
    const size = estimateSaveSize(MOCK_SAVE_STATE);
    expect(size).toBeGreaterThan(0);
  });

  test('larger state produces larger size estimate', () => {
    const bigState: SaveState = {
      ...MOCK_SAVE_STATE,
      timeline: Array.from({ length: 200 }, (_, i) => ({
        turn: i,
        timestamp: Date.now(),
        action: 'A'.repeat(200),
        result: 'B'.repeat(200),
        consequences: [],
        worldChanges: [],
      })),
    };
    expect(estimateSaveSize(bigState)).toBeGreaterThan(estimateSaveSize(MOCK_SAVE_STATE));
  });
});

// ─── autoCompress ─────────────────────────────────────────────

describe('autoCompress', () => {
  test('returns same state if under size limit', () => {
    const result = autoCompress(MOCK_SAVE_STATE, 1024 * 1024);
    expect(result).toBe(MOCK_SAVE_STATE);
  });

  test('compresses when over size limit', () => {
    const bigTimeline: TurnRecord[] = Array.from({ length: 200 }, (_, i) => ({
      turn: i,
      timestamp: Date.now(),
      action: 'A'.repeat(300),
      result: 'success',
      consequences: [],
      worldChanges: [],
    }));
    const bigState: SaveState = { ...MOCK_SAVE_STATE, timeline: bigTimeline };
    const result = autoCompress(bigState, 1024);
    expect(result.timeline.length).toBeLessThan(bigTimeline.length);
  });

  test('compressed state has required fields', () => {
    const bigState: SaveState = {
      ...MOCK_SAVE_STATE,
      timeline: Array.from({ length: 100 }, (_, i) => ({
        turn: i,
        timestamp: Date.now(),
        action: 'test action',
        result: 'success',
        consequences: [],
        worldChanges: [],
      })),
    };
    const result = autoCompress(bigState, 1);
    expect(result).toHaveProperty('session_id');
    expect(result).toHaveProperty('PC');
    expect(result).toHaveProperty('clocks');
  });
});

// ─── Save/Load Round-trip via Schema ──────────────────────────

describe('save state round-trip', () => {
  test('mock state survives JSON serialisation round-trip', () => {
    const serialised = JSON.stringify(MOCK_SAVE_STATE);
    const parsed = JSON.parse(serialised);
    const result = validateSaveState(parsed);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.session_id).toBe(MOCK_SAVE_STATE.session_id);
      expect(result.data.turn).toBe(MOCK_SAVE_STATE.turn);
      expect(result.data.PC.name).toBe(MOCK_SAVE_STATE.PC.name);
    }
  });

  test('seed is preserved through serialisation', () => {
    const serialised = JSON.stringify(MOCK_SAVE_STATE);
    const parsed = JSON.parse(serialised);
    expect(parsed.rng_seed).toBe(MOCK_SAVE_STATE.rng_seed);
  });

  test('clocks are preserved through serialisation', () => {
    const serialised = JSON.stringify(MOCK_SAVE_STATE);
    const parsed = JSON.parse(serialised);
    expect(parsed.clocks).toHaveLength(MOCK_SAVE_STATE.clocks.length);
  });
});
