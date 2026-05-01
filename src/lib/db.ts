import { openDB, type IDBPDatabase } from 'idb';
import type { SaveState, SessionMeta } from '../types';

// ─── Database Schema ──────────────────────────────────────────

const DB_NAME = 'usre_db';
const DB_VERSION = 1;

interface USRESchema {
  saves: {
    key: string; // `${session_id}::${slot}`
    value: {
      key: string;
      session_id: string;
      slot: string;
      meta: SessionMeta;
      state: SaveState;
    };
    indexes: { by_session: string };
  };
  checkpoints: {
    key: string; // `${session_id}::${turn}`
    value: {
      key: string;
      session_id: string;
      turn: number;
      label: string;
      state: SaveState;
    };
    indexes: { by_session: string };
  };
}

// ─── DB Initialization ────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<USRESchema>> | null = null;

function getDB(): Promise<IDBPDatabase<USRESchema>> {
  if (!dbPromise) {
    dbPromise = openDB<USRESchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('saves')) {
          const savesStore = db.createObjectStore('saves', { keyPath: 'key' });
          savesStore.createIndex('by_session', 'session_id');
        }
        if (!db.objectStoreNames.contains('checkpoints')) {
          const cpStore = db.createObjectStore('checkpoints', { keyPath: 'key' });
          cpStore.createIndex('by_session', 'session_id');
        }
      },
    });
  }
  return dbPromise;
}

// ─── Save Operations ──────────────────────────────────────────

export async function saveGame(
  state: SaveState,
  slot = 'autosave'
): Promise<void> {
  const db = await getDB();
  const key = `${state.session_id}::${slot}`;
  const meta: SessionMeta = {
    session_id: state.session_id,
    name: `${state.PC.name} — ${state.genre}`,
    genre: state.genre,
    archetype: state.PC.archetype,
    turn: state.turn,
    timestamp: state.timestamp,
    isCheckpoint: slot.startsWith('checkpoint'),
    isIronman: slot === 'ironman',
  };
  await db.put('saves', { key, session_id: state.session_id, slot, meta, state });
}

export async function loadGame(
  sessionId: string,
  slot = 'autosave'
): Promise<SaveState | null> {
  const db = await getDB();
  const key = `${sessionId}::${slot}`;
  const record = await db.get('saves', key);
  return record?.state ?? null;
}

export async function listSaves(sessionId?: string): Promise<SessionMeta[]> {
  const db = await getDB();
  const all = await db.getAll('saves');
  const filtered = sessionId
    ? all.filter((r) => r.session_id === sessionId)
    : all;
  return filtered.map((r) => r.meta).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function listAllSessions(): Promise<SessionMeta[]> {
  const db = await getDB();
  const all = await db.getAll('saves');
  // Deduplicate by session_id, keeping newest
  const seen = new Map<string, SessionMeta>();
  for (const record of all) {
    const existing = seen.get(record.session_id);
    if (!existing || new Date(record.meta.timestamp) > new Date(existing.timestamp)) {
      seen.set(record.session_id, record.meta);
    }
  }
  return Array.from(seen.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function deleteSave(
  sessionId: string,
  slot: string
): Promise<void> {
  const db = await getDB();
  await db.delete('saves', `${sessionId}::${slot}`);
}

// ─── Checkpoint Operations ────────────────────────────────────

export async function saveCheckpoint(
  state: SaveState,
  label = ''
): Promise<void> {
  const db = await getDB();
  const key = `${state.session_id}::${state.turn}`;
  await db.put('checkpoints', {
    key,
    session_id: state.session_id,
    turn: state.turn,
    label,
    state,
  });
  // Prune checkpoints — keep latest 10 per session
  const all = await db
    .getAllFromIndex('checkpoints', 'by_session', state.session_id);
  if (all.length > 10) {
    all.sort((a, b) => a.turn - b.turn);
    const toDelete = all.slice(0, all.length - 10);
    for (const cp of toDelete) {
      await db.delete('checkpoints', cp.key);
    }
  }
}

export async function loadLatestCheckpoint(
  sessionId: string
): Promise<SaveState | null> {
  const db = await getDB();
  const all = await db.getAllFromIndex('checkpoints', 'by_session', sessionId);
  if (all.length === 0) return null;
  all.sort((a, b) => b.turn - a.turn);
  return all[0].state;
}

export async function loadCheckpointAtTurn(
  sessionId: string,
  turn: number
): Promise<SaveState | null> {
  const db = await getDB();
  const key = `${sessionId}::${turn}`;
  const record = await db.get('checkpoints', key);
  return record?.state ?? null;
}

export async function listCheckpoints(
  sessionId: string
): Promise<Array<{ turn: number; label: string; timestamp: string }>> {
  const db = await getDB();
  const all = await db.getAllFromIndex('checkpoints', 'by_session', sessionId);
  return all
    .sort((a, b) => b.turn - a.turn)
    .map((cp) => ({
      turn: cp.turn,
      label: cp.label,
      timestamp: cp.state.timestamp,
    }));
}

// ─── Export / Import ──────────────────────────────────────────

export function exportStateJSON(state: SaveState, pretty = true): string {
  return pretty
    ? JSON.stringify(state, null, 2)
    : JSON.stringify(state);
}

export function importStateJSON(json: string): SaveState {
  const data = JSON.parse(json);
  // Basic shape check
  if (!data.session_id || !data.PC || !data.config) {
    throw new Error('Invalid save state: missing required fields.');
  }
  return data as SaveState;
}

// ─── Session Wipe ─────────────────────────────────────────────

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getDB();
  const saves = await db.getAllFromIndex('saves', 'by_session', sessionId);
  for (const s of saves) await db.delete('saves', s.key);
  const cps = await db.getAllFromIndex('checkpoints', 'by_session', sessionId);
  for (const cp of cps) await db.delete('checkpoints', cp.key);
}
