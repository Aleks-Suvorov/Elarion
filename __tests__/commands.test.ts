import {
  parseCommand,
  formatHelp,
  parseSaveSlot,
  parseLogCount,
  parseSeed,
  parseBookmark,
  parseNote,
  parseLoadJSON,
} from '../src/engine/commands';

describe('parseCommand', () => {
  test('returns null for non-command input', () => {
    expect(parseCommand('hello world')).toBeNull();
    expect(parseCommand('')).toBeNull();
    expect(parseCommand('   ')).toBeNull();
  });

  test('returns null for unknown command', () => {
    expect(parseCommand('/unknown')).toBeNull();
    expect(parseCommand('/fly')).toBeNull();
  });

  test('parses /save with no args', () => {
    const result = parseCommand('/save');
    expect(result).not.toBeNull();
    expect(result!.command).toBe('save');
    expect(result!.args).toHaveLength(0);
  });

  test('parses /save with slot name', () => {
    const result = parseCommand('/save ironman');
    expect(result!.command).toBe('save');
    expect(result!.args).toEqual(['ironman']);
  });

  test('parses /export', () => {
    const result = parseCommand('/export');
    expect(result!.command).toBe('export');
  });

  test('parses /sheet', () => {
    expect(parseCommand('/sheet')!.command).toBe('sheet');
  });

  test('parses /undo', () => {
    expect(parseCommand('/undo')!.command).toBe('undo');
  });

  test('parses /log with no args', () => {
    const result = parseCommand('/log');
    expect(result!.command).toBe('log');
    expect(result!.args).toHaveLength(0);
  });

  test('parses /log with count', () => {
    const result = parseCommand('/log 20');
    expect(result!.command).toBe('log');
    expect(result!.args).toEqual(['20']);
  });

  test('parses /bookmark with label', () => {
    const result = parseCommand('/bookmark before-dungeon');
    expect(result!.command).toBe('bookmark');
    expect(result!.args).toEqual(['before-dungeon']);
  });

  test('parses /note with multi-word text', () => {
    const result = parseCommand('/note remember the gate code');
    expect(result!.command).toBe('note');
    expect(result!.args).toEqual(['remember', 'the', 'gate', 'code']);
  });

  test('parses /seed with integer', () => {
    const result = parseCommand('/seed 42');
    expect(result!.command).toBe('seed');
    expect(result!.args).toEqual(['42']);
  });

  test('parses /help with no args', () => {
    const result = parseCommand('/help');
    expect(result!.command).toBe('help');
    expect(result!.args).toHaveLength(0);
  });

  test('parses /help with specific command', () => {
    const result = parseCommand('/help save');
    expect(result!.command).toBe('help');
    expect(result!.args).toEqual(['save']);
  });

  test('/load treats rest as single arg (whole JSON blob)', () => {
    const json = '{"version":1}';
    const result = parseCommand(`/load ${json}`);
    expect(result!.command).toBe('load');
    expect(result!.args).toEqual([json]);
  });

  test('is case-insensitive for command name', () => {
    expect(parseCommand('/SAVE')).not.toBeNull();
    expect(parseCommand('/Save')!.command).toBe('save');
  });

  test('raw field stores original input', () => {
    const result = parseCommand('/save myslot');
    expect(result!.raw).toBe('/save myslot');
  });
});

describe('parseSaveSlot', () => {
  test('defaults to autosave with no args', () => {
    expect(parseSaveSlot([])).toBe('autosave');
  });

  test('uses provided arg', () => {
    expect(parseSaveSlot(['ironman'])).toBe('ironman');
  });

  test('joins multiple args with dash', () => {
    expect(parseSaveSlot(['checkpoint', '1'])).toBe('checkpoint-1');
  });

  test('lowercases result', () => {
    expect(parseSaveSlot(['MySlot'])).toBe('myslot');
  });
});

describe('parseLogCount', () => {
  test('defaults to 10 with no args', () => {
    expect(parseLogCount([])).toBe(10);
  });

  test('parses valid integer', () => {
    expect(parseLogCount(['20'])).toBe(20);
  });

  test('clamps to 100 max', () => {
    expect(parseLogCount(['999'])).toBe(100);
  });

  test('defaults to 10 for non-numeric input', () => {
    expect(parseLogCount(['abc'])).toBe(10);
  });

  test('defaults to 10 for zero or negative', () => {
    expect(parseLogCount(['0'])).toBe(10);
    expect(parseLogCount(['-5'])).toBe(10);
  });
});

describe('parseSeed', () => {
  test('returns failure with no args', () => {
    const result = parseSeed([]);
    expect(result.success).toBe(false);
  });

  test('returns success with valid integer', () => {
    const result = parseSeed(['42']);
    expect(result.success).toBe(true);
    expect(result.data).toBe(42);
  });

  test('returns failure for non-integer string', () => {
    const result = parseSeed(['notanumber']);
    expect(result.success).toBe(false);
  });

  test('includes seed value in message on success', () => {
    const result = parseSeed(['1234']);
    expect(result.message).toContain('1234');
  });
});

describe('parseBookmark', () => {
  test('returns failure with no args', () => {
    expect(parseBookmark([]).success).toBe(false);
  });

  test('returns success with label', () => {
    const result = parseBookmark(['before-final-boss']);
    expect(result.success).toBe(true);
    expect(result.data).toBe('before-final-boss');
  });

  test('joins multi-word label', () => {
    const result = parseBookmark(['met', 'the', 'queen']);
    expect(result.data).toBe('met the queen');
  });

  test('truncates label at 60 characters', () => {
    const longLabel = 'a'.repeat(100).split('');
    const result = parseBookmark(longLabel);
    expect((result.data as string).length).toBeLessThanOrEqual(60);
  });
});

describe('parseNote', () => {
  test('returns failure with no args', () => {
    expect(parseNote([]).success).toBe(false);
  });

  test('returns success with text', () => {
    const result = parseNote(['suspicious', 'merchant']);
    expect(result.success).toBe(true);
    expect(result.data).toBe('suspicious merchant');
  });

  test('truncates note at 200 characters', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`);
    const result = parseNote(words);
    expect((result.data as string).length).toBeLessThanOrEqual(200);
  });
});

describe('parseLoadJSON', () => {
  test('returns failure with no args', () => {
    expect(parseLoadJSON([]).success).toBe(false);
  });

  test('returns success for valid JSON', () => {
    const result = parseLoadJSON(['{"version":1}']);
    expect(result.success).toBe(true);
    expect((result.data as Record<string, unknown>).version).toBe(1);
  });

  test('returns failure for invalid JSON', () => {
    const result = parseLoadJSON(['{not valid json}']);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid JSON');
  });
});

describe('formatHelp', () => {
  test('returns help text listing all commands', () => {
    const help = formatHelp();
    expect(help).toContain('/save');
    expect(help).toContain('/export');
    expect(help).toContain('/load');
    expect(help).toContain('/sheet');
    expect(help).toContain('/log');
    expect(help).toContain('/undo');
    expect(help).toContain('/bookmark');
    expect(help).toContain('/note');
    expect(help).toContain('/seed');
    expect(help).toContain('/help');
  });

  test('returns specific help for a known command', () => {
    const help = formatHelp('save');
    expect(help).toContain('/save');
    expect(help).toContain('Usage');
  });

  test('returns error message for unknown command', () => {
    const help = formatHelp('unknown');
    expect(help).toContain('Unknown command');
  });
});
