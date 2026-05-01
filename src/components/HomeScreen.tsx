'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '../state/uiStore';
import { useGameStore } from '../state/gameStore';
import { listAllSessions } from '../lib/db';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import type { SessionMeta } from '../types';

const TAGLINES = [
  'Every world is seeded. Every roll is visible. Every campaign is yours.',
  'Deterministic chaos. Transparent consequence. Infinite replayability.',
  'Not a chatbot. A living world simulation with a narrative interface.',
  'Build your world. Roll your dice. Face what comes.',
];

export function HomeScreen() {
  const { setMode, openImportModal } = useUIStore();
  const { loadFromSaveState, startSetup } = useGameStore();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);

  useEffect(() => {
    listAllSessions().then(setSessions).catch(() => {});
  }, []);

  const handleNewGame = () => {
    startSetup();
    setMode('setup');
  };

  const handleLoadSession = async (meta: SessionMeta) => {
    const { loadGame } = await import('../lib/db');
    const state = await loadGame(meta.session_id, 'autosave');
    if (state) {
      loadFromSaveState(state);
      setMode('play');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="font-mono text-4xl font-bold tracking-widest text-accent-gold mb-2">
          USRE
        </h1>
        <p className="text-xs text-muted uppercase tracking-[0.3em] mb-4">
          Ultimate Sandbox RPG Engine
        </p>
        <p className="text-sm text-gray-400 max-w-md mx-auto italic">{tagline}</p>
      </div>

      {/* Genre badges */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-10 max-w-md">
        {['Fantasy', 'Sci-Fi', 'Zombie', 'Modern', 'Cyberpunk', 'Historical', 'Mixed'].map(
          (g) => (
            <Badge key={g} variant="muted">{g}</Badge>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs mb-12">
        <Button variant="primary" size="lg" onClick={handleNewGame} className="w-full">
          New Session
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={openImportModal}
          className="w-full"
        >
          Import Save JSON
        </Button>
      </div>

      {/* Previous sessions */}
      {sessions.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-xs text-muted uppercase tracking-wider mb-3">
            Continue a Session
          </p>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 4).map((meta) => (
              <button
                key={meta.session_id}
                onClick={() => handleLoadSession(meta)}
                className="w-full text-left border border-faint rounded-lg p-3 bg-surface-1 hover:border-accent-gold/40 hover:bg-surface-2 transition-colors"
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-medium text-gray-200">{meta.name}</span>
                  <Badge variant="muted">T{meta.turn}</Badge>
                </div>
                <div className="flex gap-3 text-xs text-muted">
                  <span className="capitalize">{meta.genre}</span>
                  <span>·</span>
                  <span>{meta.archetype}</span>
                  <span>·</span>
                  <span>{new Date(meta.timestamp).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feature list */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl text-xs text-gray-600">
        {[
          ['⚄', 'd10 Resolution', 'All rolls visible. DC 3–10. Crits & fumbles matter.'],
          ['◷', 'Living World', 'Clocks tick. Factions act. Consequences persist.'],
          ['⊙', 'Local-First', 'All data stays on your machine. IndexedDB persistence.'],
          ['⊞', 'Any Genre', '7 genres. Infinite combinations. Seeded determinism.'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="flex flex-col gap-1 text-center p-3 border border-faint rounded bg-surface-1">
            <span className="text-lg">{icon}</span>
            <span className="font-medium text-gray-500">{title}</span>
            <span className="leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
