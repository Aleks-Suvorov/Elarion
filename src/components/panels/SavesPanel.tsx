'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useUIStore } from '../../state/uiStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  saveGame,
  loadGame,
  listAllSessions,
  saveCheckpoint,
  loadLatestCheckpoint,
  exportStateJSON,
} from '../../lib/db';
import type { SessionMeta, SaveState } from '../../types';

export function SavesPanel() {
  const { buildSaveState, loadFromSaveState } = useGameStore();
  const { openExportModal, openImportModal, setError } = useUIStore();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    listAllSessions().then(setSessions).catch(console.error);
  }, []);

  const handleSave = async () => {
    const state = buildSaveState();
    if (!state) {
      setError('Nothing to save. Start a session first.');
      return;
    }
    setSaving(true);
    try {
      await saveGame(state, 'autosave');
      await saveCheckpoint(state, `Turn ${state.turn}`);
      setLastSaved(new Date().toLocaleTimeString());
      const updated = await listAllSessions();
      setSessions(updated);
    } catch (err) {
      setError(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const state = buildSaveState();
    if (!state) {
      setError('Nothing to export.');
      return;
    }
    openExportModal(exportStateJSON(state));
  };

  const handleUndo = async () => {
    const state = buildSaveState();
    if (!state) return;
    setLoading(true);
    try {
      const checkpoint = await loadLatestCheckpoint(state.session_id);
      if (!checkpoint) {
        setError('No checkpoint to restore.');
        return;
      }
      loadFromSaveState(checkpoint);
    } catch (err) {
      setError(`Restore failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSession = async (meta: SessionMeta) => {
    setLoading(true);
    try {
      const state = await loadGame(meta.session_id, 'autosave');
      if (!state) {
        setError('Save slot not found.');
        return;
      }
      loadFromSaveState(state);
    } catch (err) {
      setError(`Load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Actions */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Save / Load</p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="sm" onClick={handleSave} loading={saving} className="w-full">
            /save — Save to Slot
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
            /export — Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={openImportModal} className="w-full">
            /load — Import JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={handleUndo} loading={loading} className="w-full">
            /undo — Restore Checkpoint
          </Button>
        </div>
        {lastSaved && (
          <p className="text-muted text-center mt-2">Saved at {lastSaved}</p>
        )}
      </section>

      {/* Session list */}
      {sessions.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Sessions ({sessions.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {sessions.map((meta) => (
              <div
                key={meta.session_id}
                className="border border-faint rounded p-2.5 bg-surface-2 cursor-pointer hover:border-accent-gold/40 hover:bg-accent-gold/5 transition-colors"
                onClick={() => handleLoadSession(meta)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-200">{meta.name}</span>
                  <Badge variant="muted">T{meta.turn}</Badge>
                </div>
                <div className="flex gap-2 text-muted">
                  <span className="capitalize">{meta.genre}</span>
                  <span>·</span>
                  <span>{meta.archetype}</span>
                </div>
                <p className="text-gray-600 mt-0.5">
                  {new Date(meta.timestamp).toLocaleDateString()} {new Date(meta.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
