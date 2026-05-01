import { create } from 'zustand';
import type { SessionMeta } from '../types';

interface SessionStore {
  sessions: SessionMeta[];
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;

  setSessions(sessions: SessionMeta[]): void;
  setActiveSession(sessionId: string | null): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  addSession(meta: SessionMeta): void;
  removeSession(sessionId: string): void;
  updateSession(sessionId: string, updates: Partial<SessionMeta>): void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  activeSessionId: null,
  loading: false,
  error: null,

  setSessions: (sessions) => set({ sessions }),

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  addSession: (meta) =>
    set((s) => ({
      sessions: [meta, ...s.sessions.filter((m) => m.session_id !== meta.session_id)],
    })),

  removeSession: (sessionId) =>
    set((s) => ({
      sessions: s.sessions.filter((m) => m.session_id !== sessionId),
    })),

  updateSession: (sessionId, updates) =>
    set((s) => ({
      sessions: s.sessions.map((m) =>
        m.session_id === sessionId ? { ...m, ...updates } : m
      ),
    })),
}));
