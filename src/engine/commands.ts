import type { CommandName, ParsedCommand, CommandResult } from '../types';

// ─── Command Registry ─────────────────────────────────────────

const COMMAND_DEFS: Record<
  CommandName,
  { description: string; usage: string; examples: string[] }
> = {
  save: {
    description: 'Save current game state to a named slot',
    usage: '/save [slot-name]',
    examples: ['/save', '/save ironman', '/save checkpoint-1'],
  },
  export: {
    description: 'Export save state as JSON for backup or transfer',
    usage: '/export',
    examples: ['/export'],
  },
  load: {
    description: 'Load a save state from JSON (paste full JSON after command)',
    usage: '/load {JSON}',
    examples: ['/load {"session_id":"..."}'],
  },
  sheet: {
    description: 'Display character sheet summary',
    usage: '/sheet',
    examples: ['/sheet'],
  },
  log: {
    description: 'Display recent roll log and action history',
    usage: '/log [count]',
    examples: ['/log', '/log 20'],
  },
  undo: {
    description: 'Undo the last action (restore previous checkpoint)',
    usage: '/undo',
    examples: ['/undo'],
  },
  bookmark: {
    description: 'Bookmark current turn with a label for later reference',
    usage: '/bookmark <label>',
    examples: ['/bookmark met-queen', '/bookmark before-dungeon'],
  },
  note: {
    description: 'Add a short note to the session log',
    usage: '/note <text>',
    examples: ['/note suspicious merchant', '/note remember the eastern gate code'],
  },
  seed: {
    description: 'Reseed the RNG (affects future rolls only)',
    usage: '/seed <integer>',
    examples: ['/seed 42', '/seed 1234567890'],
  },
  help: {
    description: 'Display available commands',
    usage: '/help [command]',
    examples: ['/help', '/help save', '/help bookmark'],
  },
};

// ─── Parser ───────────────────────────────────────────────────

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  // Strip leading slash and split on whitespace
  const raw = trimmed.slice(1);
  const firstSpace = raw.indexOf(' ');
  const commandStr = firstSpace === -1 ? raw : raw.slice(0, firstSpace);
  const rest = firstSpace === -1 ? '' : raw.slice(firstSpace + 1).trim();

  const command = commandStr.toLowerCase() as CommandName;
  if (!isValidCommand(command)) return null;

  // For /load, the "arg" is the entire remaining JSON blob
  const args =
    command === 'load'
      ? rest ? [rest] : []
      : rest
      ? rest.split(/\s+/)
      : [];

  return { command, args, raw: trimmed };
}

function isValidCommand(str: string): str is CommandName {
  return str in COMMAND_DEFS;
}

// ─── Help Formatter ───────────────────────────────────────────

export function formatHelp(commandName?: string): string {
  if (commandName) {
    const cmd = commandName.toLowerCase().replace(/^\//, '') as CommandName;
    const def = COMMAND_DEFS[cmd];
    if (!def) {
      return `Unknown command: /${cmd}\n\nType /help to see all commands.`;
    }
    return [
      `/${cmd} — ${def.description}`,
      `Usage:    ${def.usage}`,
      `Examples: ${def.examples.join('  |  ')}`,
    ].join('\n');
  }

  const lines = ['USRE COMMANDS', '─'.repeat(40)];
  for (const [name, def] of Object.entries(COMMAND_DEFS)) {
    lines.push(`  /${name.padEnd(10)} ${def.description}`);
  }
  lines.push('─'.repeat(40));
  lines.push('Type any action freely — no slash needed for gameplay.');
  lines.push('Use /help <command> for detailed usage.');
  return lines.join('\n');
}

// ─── Dispatch Helpers ─────────────────────────────────────────

/** Extract slot name for /save, defaulting to "autosave" */
export function parseSaveSlot(args: string[]): string {
  return args.length > 0 ? args.join('-').toLowerCase() : 'autosave';
}

/** Extract log count for /log, defaulting to 10 */
export function parseLogCount(args: string[]): number {
  const n = parseInt(args[0] ?? '10', 10);
  return isNaN(n) || n < 1 ? 10 : Math.min(n, 100);
}

/** Extract and validate seed for /seed */
export function parseSeed(args: string[]): CommandResult {
  const raw = args[0];
  if (!raw) {
    return { success: false, message: 'Provide an integer seed. Usage: /seed <integer>' };
  }
  const n = parseInt(raw, 10);
  if (isNaN(n)) {
    return { success: false, message: `"${raw}" is not a valid integer seed.` };
  }
  return { success: true, message: `RNG reseeded to ${n}.`, data: n };
}

/** Extract bookmark label */
export function parseBookmark(args: string[]): CommandResult {
  if (args.length === 0) {
    return {
      success: false,
      message: 'Provide a label. Usage: /bookmark <label>',
    };
  }
  const label = args.join(' ').slice(0, 60);
  return { success: true, message: `Bookmarked: "${label}"`, data: label };
}

/** Extract note text */
export function parseNote(args: string[]): CommandResult {
  if (args.length === 0) {
    return {
      success: false,
      message: 'Provide note text. Usage: /note <text>',
    };
  }
  const text = args.join(' ').slice(0, 200);
  return { success: true, message: `Note added: "${text}"`, data: text };
}

/** Validate and parse load JSON */
export function parseLoadJSON(args: string[]): CommandResult {
  const json = args.join(' ');
  if (!json) {
    return {
      success: false,
      message: 'Provide JSON after /load. Usage: /load {JSON}',
    };
  }
  try {
    const data = JSON.parse(json);
    return { success: true, message: 'JSON parsed successfully.', data };
  } catch (err) {
    return {
      success: false,
      message: `Invalid JSON: ${(err as Error).message}`,
    };
  }
}
