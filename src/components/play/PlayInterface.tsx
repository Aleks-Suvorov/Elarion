'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../state/gameStore';
import { useUIStore } from '../../state/uiStore';
import { parseCommand, formatHelp, parseSaveSlot, parseLogCount, parseSeed, parseBookmark, parseNote, parseLoadJSON } from '../../engine/commands';
import { resolveAction } from '../../engine/resolution';
import { TemplateNarrativeAdapter } from '../../lib/narrative';
import { saveGame, saveCheckpoint } from '../../lib/db';
import { tickClocks, advanceTime, maybeGenerateEvent, applyWorldConsequence, updateNPCDispositions } from '../../engine/worldSim';
import { tickSurvival } from '../../engine/survival';
import { awardXP } from '../../engine/progression';
import { autoCompress } from '../../lib/compression';
import { RollDisplay, RollLog } from '../ui/RollDisplay';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrackBar } from '../ui/TrackBar';
import { clsx } from 'clsx';
import type { GameMessage, RollResult } from '../../types';

const NARRATIVE_ADAPTER = new TemplateNarrativeAdapter();
const CHECKPOINT_EVERY = 5;

export function PlayInterface() {
  const store = useGameStore();
  const { setMode, setSidePanelTab, setSidePanelOpen, openExportModal, openImportModal, setError } = useUIStore();

  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRollLog, setShowRollLog] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [store.messages, scrollToBottom]);
  useEffect(() => { inputRef.current?.focus(); }, [processing]);

  // Initial situation on mount
  useEffect(() => {
    if (store.messages.length === 0 && store.character && store.world && store.location && store.config) {
      generateSituation();
    }
  }, []);

  const generateSituation = async () => {
    if (!store.character || !store.world || !store.location || !store.config) return;

    const ctx = {
      turn: store.turn,
      location: store.location,
      character: store.character,
      world: store.world,
      config: store.config,
      recentHistory: store.timeline.slice(-5),
    };

    try {
      const output = await NARRATIVE_ADAPTER.generateSituation(ctx);
      store.addMessage({ type: 'narrative', content: output.situation });
      setOptions(output.options);
    } catch {
      store.addMessage({ type: 'system', content: 'The world holds its breath…' });
      setOptions(['Look around', 'Check your equipment', 'Rest briefly', 'Move on']);
    }
  };

  const processAction = async (actionText: string) => {
    if (!store.character || !store.world || !store.config || !store.location) return;

    setProcessing(true);
    store.addMessage({ type: 'system', content: `> ${actionText}`, turn: store.turn });

    // Handle commands
    const cmd = parseCommand(actionText);
    if (cmd) {
      await handleCommand(cmd.command, cmd.args);
      setProcessing(false);
      return;
    }

    // Process game action
    const rng = store.getRNG();
    const resolution = resolveAction({
      action: actionText,
      character: store.character,
      config: store.config,
      rng,
      turn: store.turn,
    });

    const { roll, consequence, xpGained, hpDelta, staminaDelta, narrativeHints } = resolution;

    // Show roll
    store.addMessage({ type: 'roll', content: '', rollResult: roll, turn: store.turn });
    store.addRollResult(roll);

    // Apply character changes
    if (hpDelta !== 0) store.applyHPDelta(hpDelta);
    if (staminaDelta !== 0) store.applyStaminaDelta(staminaDelta);
    if (xpGained > 0) store.grantXP(xpGained);

    // Tag the action
    store.addActionTag(consequence);

    // Generate consequence narrative
    const ctx = {
      turn: store.turn,
      location: store.location,
      character: store.character,
      world: store.world,
      config: store.config,
      lastAction: actionText,
      lastResult: consequence,
      recentHistory: store.timeline.slice(-5),
    };

    try {
      const consequenceText = await NARRATIVE_ADAPTER.generateConsequence(actionText, roll, ctx);
      store.addMessage({ type: 'narrative', content: consequenceText, turn: store.turn });
    } catch {
      store.addMessage({ type: 'narrative', content: narrativeHints[0] ?? 'The action plays out.', turn: store.turn });
    }

    // World simulation tick
    let world = store.world;

    // Tick clocks
    const { clocks, completed } = tickClocks(world.clocks);
    world = { ...world, clocks };

    for (const clock of completed) {
      store.addMessage({ type: 'system', content: `⏰ Clock complete: "${clock.name}" — ${clock.onComplete}` });
    }

    // Advance time
    const newTime = advanceTime(world.time, rng.nextInt(1, 3));
    world = { ...world, time: newTime };

    // Random event
    const event = maybeGenerateEvent(store.config, world, rng, store.turn);
    if (event) {
      store.addMessage({ type: 'system', content: `🌐 World Event: ${event}` });
    }

    // Survival tick
    if (store.config.survivalEnabled && store.character) {
      const { tracks, alerts } = tickSurvival(store.character.tracks, store.config);
      store.updateCharacter({ tracks });
      for (const alert of alerts) {
        store.addMessage({ type: 'error', content: `⚠ ${alert}` });
      }
    }

    // Update NPC dispositions
    const updatedNPCs = updateNPCDispositions(world.npcs, store.actionTags.slice(-10), store.config);
    world = { ...world, npcs: updatedNPCs };
    store.setWorld(world);

    // Record turn
    store.addTurnRecord({
      turn: store.turn,
      timestamp: Date.now(),
      action: actionText,
      result: narrativeHints[0] ?? '',
      rollResult: roll,
      consequences: narrativeHints,
      worldChanges: completed.map((c) => `clock: ${c.name}`),
    });

    store.incrementTurn();

    // Auto-checkpoint (read fresh turn after increment)
    const freshTurn = useGameStore.getState().turn;
    if (freshTurn > 0 && freshTurn % CHECKPOINT_EVERY === 0) {
      const saveState = store.buildSaveState();
      if (saveState) {
        const compressed = autoCompress(saveState);
        saveCheckpoint(compressed, `Auto T${freshTurn}`).catch(console.error);
        saveGame(compressed, 'autosave').catch(console.error);
      }
    }

    // XP level up check (read fresh character after grantXP)
    const freshChar = useGameStore.getState().character;
    if (freshChar && freshChar.xp >= freshChar.xpToNext) {
      const { character: leveled, leveledUp, message } = awardXP(freshChar, 0);
      if (leveledUp) {
        store.finalizeCharacter(leveled);
        store.addMessage({ type: 'success', content: `🎉 ${message}` });
      }
    }

    // Next situation
    await generateSituation();
    setProcessing(false);
  };

  const handleCommand = async (command: string, args: string[]) => {
    switch (command) {
      case 'save': {
        const slot = parseSaveSlot(args);
        const state = store.buildSaveState();
        if (!state) { store.addMessage({ type: 'error', content: 'Nothing to save.' }); break; }
        try {
          await saveGame(state, slot);
          store.addMessage({ type: 'command', content: `✓ Saved to slot "${slot}".` });
        } catch (e) {
          store.addMessage({ type: 'error', content: `Save failed: ${(e as Error).message}` });
        }
        break;
      }
      case 'export': {
        const state = store.buildSaveState();
        if (!state) { store.addMessage({ type: 'error', content: 'Nothing to export.' }); break; }
        const { exportStateJSON } = await import('../../lib/db');
        openExportModal(exportStateJSON(state));
        store.addMessage({ type: 'command', content: '↗ Export modal opened.' });
        break;
      }
      case 'load': {
        const result = parseLoadJSON(args);
        if (!result.success) {
          store.addMessage({ type: 'error', content: result.message });
        } else {
          store.loadFromSaveState(result.data as never);
          store.addMessage({ type: 'command', content: '✓ Session loaded.' });
        }
        break;
      }
      case 'sheet': {
        setSidePanelTab('sheet');
        setSidePanelOpen(true);
        store.addMessage({ type: 'command', content: '📋 Character sheet opened.' });
        break;
      }
      case 'log': {
        const count = parseLogCount(args);
        setShowRollLog(true);
        store.addMessage({ type: 'command', content: `🎲 Showing last ${count} rolls.` });
        break;
      }
      case 'undo': {
        const { loadLatestCheckpoint } = await import('../../lib/db');
        const sid = store.sessionId;
        if (!sid) { store.addMessage({ type: 'error', content: 'No session active.' }); break; }
        const cp = await loadLatestCheckpoint(sid);
        if (!cp) { store.addMessage({ type: 'error', content: 'No checkpoint found.' }); break; }
        store.loadFromSaveState(cp);
        store.addMessage({ type: 'command', content: `↩ Restored checkpoint at turn ${cp.turn}.` });
        break;
      }
      case 'bookmark': {
        const result = parseBookmark(args);
        if (!result.success) {
          store.addMessage({ type: 'error', content: result.message });
        } else {
          store.addBookmark(result.data as string);
          store.addMessage({ type: 'command', content: `🔖 ${result.message}` });
        }
        break;
      }
      case 'note': {
        const result = parseNote(args);
        if (!result.success) {
          store.addMessage({ type: 'error', content: result.message });
        } else {
          store.addNote(result.data as string);
          store.addMessage({ type: 'command', content: `📝 ${result.message}` });
        }
        break;
      }
      case 'seed': {
        const result = parseSeed(args);
        if (!result.success) {
          store.addMessage({ type: 'error', content: result.message });
        } else {
          store.reseed(result.data as number);
          store.addMessage({ type: 'command', content: `🎰 ${result.message}` });
        }
        break;
      }
      case 'help': {
        store.addMessage({ type: 'command', content: formatHelp(args[0]) });
        break;
      }
    }
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || processing) return;
    setInput('');
    setOptions([]);
    processAction(text);
  };

  const char = store.character;

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      {char && (() => {
        const hpPct = char.tracks.hp.current / char.tracks.hp.max;
        const hpCritical = hpPct <= 0.25;
        return (
          <div className="relative flex items-center gap-4 px-4 py-2 bg-surface-1/95 border-b border-faint text-xs shrink-0 overflow-x-auto backdrop-blur-sm">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/15 to-transparent pointer-events-none" />
            <span className={clsx('font-medium whitespace-nowrap glow-gold-sm', hpCritical ? 'text-accent-red glow-red animate-hp-crit' : 'text-accent-gold')}>
              {char.name}
            </span>
            <span className="text-muted font-mono">Lv {char.level}</span>
            <div className="w-24">
              <TrackBar track={char.tracks.hp} showLabel={false} size="sm" />
            </div>
            <span className={clsx('tabular-nums font-mono', hpCritical ? 'text-accent-red animate-hp-crit' : 'text-gray-400')}>
              {char.tracks.hp.current}/{char.tracks.hp.max} HP
            </span>
            {char.tracks.stamina && (
              <>
                <div className="w-16">
                  <TrackBar track={char.tracks.stamina} showLabel={false} size="sm" />
                </div>
                <span className="tabular-nums text-muted font-mono">{char.tracks.stamina.current} Stam</span>
              </>
            )}
            <div className="w-px h-3 bg-faint" />
            <span className="text-accent-gold/60 font-mono whitespace-nowrap">T{store.turn}</span>
            {store.location && (
              <span className="text-gray-500 whitespace-nowrap truncate max-w-[140px]">
                <span className="text-faint">@ </span>{store.location.regionName}
              </span>
            )}
          </div>
        );
      })()}

      {/* Message pane */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {store.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {processing && (
          <div className="flex items-center gap-2 text-muted text-sm">
            <span className="inline-block w-3 h-3 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
            <span>Processing…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Roll log overlay */}
      {showRollLog && (
        <div className="mx-4 mb-2 bg-surface-1 border border-faint rounded p-3 max-h-48 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted uppercase tracking-wider">Roll Log</span>
            <button onClick={() => setShowRollLog(false)} className="text-muted hover:text-gray-300 text-xs">✕</button>
          </div>
          <RollLog rolls={store.rollLog} maxVisible={20} />
        </div>
      )}

      {/* Options */}
      {options.length > 0 && !processing && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => { setOptions([]); processAction(opt); }}
              className="text-xs bg-surface-2 border border-faint rounded px-3 py-1.5 text-gray-300 hover:border-accent-gold/40 hover:text-gray-100 hover:bg-surface-3 transition-colors text-left"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-faint shrink-0 bg-surface-1/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={processing}
            className={clsx(
              'flex-1 bg-surface-0 border border-faint rounded px-3 py-2.5 text-sm text-gray-100',
              'placeholder:text-gray-700 font-mono',
              'focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/15',
              'focus:shadow-[0_0_16px_rgba(201,168,76,0.1)]',
              'disabled:opacity-40 transition-all duration-200'
            )}
            placeholder="Enter action or /command…"
          />
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={processing || !input.trim()}
          >
            →
          </Button>
        </div>
        <p className="text-[9px] text-gray-700 mt-1.5 text-center tracking-wider">
          /save · /load · /sheet · /log · /undo · /bookmark · /note · /seed · /help
        </p>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────

function MessageBubble({ message }: { message: GameMessage }) {
  const typeStyles: Record<string, string> = {
    narrative: 'text-gray-300 leading-relaxed',
    system:   'text-gray-600 text-sm italic pl-2 border-l border-faint',
    command:  'text-accent-blue text-sm font-mono pl-2 border-l-2 border-accent-blue/30',
    error:    'text-accent-red text-sm font-mono pl-2 border-l-2 border-accent-red/40 bg-accent-red/5 rounded pr-2 py-0.5',
    success:  'text-accent-green text-sm font-semibold pl-2 border-l-2 border-accent-green/40 bg-accent-green/5 rounded pr-2 py-0.5',
    separator:'text-faint text-xs text-center',
  };

  if (message.type === 'roll' && message.rollResult) {
    return (
      <div className="animate-fade-in">
        <RollDisplay roll={message.rollResult} />
      </div>
    );
  }

  if (message.type === 'options' && message.options) {
    return null; // Options are rendered separately
  }

  return (
    <div className={clsx('animate-fade-in', typeStyles[message.type] ?? 'text-gray-300')}>
      {message.turn !== undefined && message.type !== 'narrative' && message.type !== 'system' && (
        <span className="text-[10px] text-muted mr-2 font-mono">[T{message.turn}]</span>
      )}
      <span>{message.content}</span>
    </div>
  );
}
