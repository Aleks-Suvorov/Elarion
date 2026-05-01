import { createRNG, seedFromString } from '../src/lib/rng';
import {
  DC,
  AUTO_SUCCESS_THRESHOLD,
  statMod,
  totalModifier,
  resolveRoll,
  rollSummary,
  lethalityDamageScale,
} from '../src/engine/dice';
import type { Stats } from '../src/types';

const FIXED_SEED = 0xdeadbeef;

describe('statMod', () => {
  test('1–3 returns -1', () => {
    expect(statMod(1)).toBe(-1);
    expect(statMod(3)).toBe(-1);
  });
  test('4–6 returns 0', () => {
    expect(statMod(4)).toBe(0);
    expect(statMod(6)).toBe(0);
  });
  test('7–8 returns +1', () => {
    expect(statMod(7)).toBe(1);
    expect(statMod(8)).toBe(1);
  });
  test('9–10 returns +2', () => {
    expect(statMod(9)).toBe(2);
    expect(statMod(10)).toBe(2);
  });
});

describe('DC constants', () => {
  test('TRIVIAL=3, ROUTINE=5, TOUGH=7, EXTREME=9, IMPOSSIBLE=10', () => {
    expect(DC.TRIVIAL).toBe(3);
    expect(DC.ROUTINE).toBe(5);
    expect(DC.TOUGH).toBe(7);
    expect(DC.EXTREME).toBe(9);
    expect(DC.IMPOSSIBLE).toBe(10);
  });
  test('AUTO_SUCCESS_THRESHOLD is 2', () => {
    expect(AUTO_SUCCESS_THRESHOLD).toBe(2);
  });
});

describe('totalModifier', () => {
  const stats: Stats = {
    strength: 5,
    agility: 8,
    endurance: 6,
    perception: 9,
    intellect: 7,
    willpower: 4,
    charisma: 10,
    luck: 3,
  };

  test('uses stat modifier only when no bonuses', () => {
    expect(totalModifier(stats, 'agility')).toBe(1);   // 8 → +1
    expect(totalModifier(stats, 'luck')).toBe(-1);      // 3 → -1
    expect(totalModifier(stats, 'charisma')).toBe(2);   // 10 → +2
  });

  test('adds skill bonus', () => {
    expect(totalModifier(stats, 'intellect', 1)).toBe(2); // +1 + 1 skill
  });

  test('adds situational bonus', () => {
    expect(totalModifier(stats, 'strength', 0, -1)).toBe(-1); // +0 + -1 sit
  });

  test('defaults missing stat to 5 (mod 0)', () => {
    const sparse = { strength: 5, agility: 5, endurance: 5, perception: 5, intellect: 5, willpower: 5, charisma: 5, luck: 5 } as Stats;
    expect(totalModifier(sparse, 'tech' as keyof Stats)).toBe(0);
  });
});

describe('resolveRoll — determinism', () => {
  test('same seed produces same results', () => {
    const rng1 = createRNG(FIXED_SEED);
    const rng2 = createRNG(FIXED_SEED);
    const r1 = resolveRoll(rng1, DC.ROUTINE, 0, 'none', 1);
    const r2 = resolveRoll(rng2, DC.ROUTINE, 0, 'none', 1);
    expect(r1.kept).toBe(r2.kept);
    expect(r1.total).toBe(r2.total);
    expect(r1.success).toBe(r2.success);
  });

  test('different seeds produce different sequences (probabilistically)', () => {
    const rng1 = createRNG(0x11111111);
    const rng2 = createRNG(0x22222222);
    const rolls1 = Array.from({ length: 10 }, () => resolveRoll(rng1, 5, 0, 'none', 0).kept);
    const rolls2 = Array.from({ length: 10 }, () => resolveRoll(rng2, 5, 0, 'none', 0).kept);
    expect(rolls1).not.toEqual(rolls2);
  });
});

describe('resolveRoll — auto-success', () => {
  test('auto-success when dc <= 2 and modifier >= 0', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, 2, 0, 'none', 0);
    expect(result.isAutoSuccess).toBe(true);
    expect(result.success).toBe(true);
    expect(result.dice).toHaveLength(0);
  });

  test('no auto-success when dc <= 2 but modifier < 0', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, 2, -1, 'none', 0);
    expect(result.isAutoSuccess).toBe(false);
  });

  test('no auto-success when dc = 3', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, 3, 1, 'none', 0);
    expect(result.isAutoSuccess).toBe(false);
  });
});

describe('resolveRoll — advantage/disadvantage', () => {
  test('advantage rolls two dice and keeps highest', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, DC.ROUTINE, 0, 'advantage', 0);
    expect(result.dice).toHaveLength(2);
    expect(result.kept).toBe(Math.max(...result.dice));
  });

  test('disadvantage rolls two dice and keeps lowest', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, DC.ROUTINE, 0, 'disadvantage', 0);
    expect(result.dice).toHaveLength(2);
    expect(result.kept).toBe(Math.min(...result.dice));
  });

  test('none rolls one die', () => {
    const rng = createRNG(FIXED_SEED);
    const result = resolveRoll(rng, DC.ROUTINE, 0, 'none', 0);
    expect(result.dice).toHaveLength(1);
  });
});

describe('resolveRoll — crit and fumble', () => {
  test('kept=10 sets isCrit', () => {
    // Force a crit by manipulating mock (find a seed that gives 10 first)
    // Instead: test the logic directly by inspecting results
    const rng = createRNG(FIXED_SEED);
    let foundCrit = false;
    for (let i = 0; i < 200; i++) {
      const r = resolveRoll(rng, DC.ROUTINE, 0, 'none', i);
      if (r.kept === 10) { expect(r.isCrit).toBe(true); foundCrit = true; break; }
    }
    expect(foundCrit).toBe(true);
  });

  test('kept=1 sets isFumble', () => {
    const rng = createRNG(FIXED_SEED);
    let foundFumble = false;
    for (let i = 0; i < 200; i++) {
      const r = resolveRoll(rng, DC.ROUTINE, 0, 'none', i);
      if (r.kept === 1) { expect(r.isFumble).toBe(true); foundFumble = true; break; }
    }
    expect(foundFumble).toBe(true);
  });
});

describe('resolveRoll — dice range', () => {
  test('d10 values always 1–10', () => {
    const rng = createRNG(FIXED_SEED);
    for (let i = 0; i < 500; i++) {
      const r = resolveRoll(rng, DC.ROUTINE, 0, 'none', i);
      expect(r.kept).toBeGreaterThanOrEqual(1);
      expect(r.kept).toBeLessThanOrEqual(10);
    }
  });
});

describe('resolveRoll — fairness (chi-square approximation)', () => {
  test('1000 rolls are roughly uniform (each face >= 50 occurrences)', () => {
    const rng = createRNG(42);
    const counts: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) counts[i] = 0;
    for (let i = 0; i < 1000; i++) {
      const r = resolveRoll(rng, 99, 0, 'none', i);
      counts[r.kept]++;
    }
    for (let face = 1; face <= 10; face++) {
      expect(counts[face]).toBeGreaterThanOrEqual(50);
    }
  });
});

describe('rollSummary', () => {
  test('returns auto-✓ for auto-success', () => {
    const rng = createRNG(FIXED_SEED);
    const r = resolveRoll(rng, 1, 0, 'none', 0);
    expect(rollSummary(r)).toBe('auto-✓');
  });

  test('includes kept, modifier, total, dc, and mark', () => {
    const rng = createRNG(FIXED_SEED);
    const r = resolveRoll(rng, 5, 1, 'none', 5);
    const s = rollSummary(r);
    expect(s).toContain(`vs DC5`);
    expect(s).toMatch(/[✓✗]/);
  });
});

describe('lethalityDamageScale', () => {
  test('lethality 1 returns 0.65', () => {
    expect(lethalityDamageScale(1)).toBeCloseTo(0.65);
  });
  test('lethality 10 returns 2.0', () => {
    expect(lethalityDamageScale(10)).toBeCloseTo(2.0);
  });
  test('scales linearly', () => {
    expect(lethalityDamageScale(5)).toBeCloseTo(1.25);
  });
});

describe('seedFromString', () => {
  test('same string gives same seed', () => {
    expect(seedFromString('hello')).toBe(seedFromString('hello'));
  });
  test('different strings give different seeds', () => {
    expect(seedFromString('hello')).not.toBe(seedFromString('world'));
  });
  test('returns a number', () => {
    expect(typeof seedFromString('test')).toBe('number');
  });
});
