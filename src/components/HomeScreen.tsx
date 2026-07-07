'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '../state/uiStore';
import { useGameStore } from '../state/gameStore';
import { listAllSessions } from '../lib/db';
import { clsx } from 'clsx';
import type { SessionMeta } from '../types';

const TAGLINES = [
  'Every world is seeded. Every roll is visible. Every campaign is yours.',
  'Deterministic chaos. Transparent consequence. Infinite replayability.',
  'Not a chatbot. A living world engine with a narrative interface.',
  'Build your world. Roll your dice. Face what comes.',
];

const GENRES: Array<{ name: string; cls: string }> = [
  { name: 'Fantasy',    cls: 'text-purple-400  border-purple-500/25  hover:border-purple-400/70  hover:text-purple-200  hover:shadow-[0_0_14px_rgba(192,132,252,0.45)]' },
  { name: 'Sci-Fi',     cls: 'text-sky-400     border-sky-500/25     hover:border-sky-400/70     hover:text-sky-200     hover:shadow-[0_0_14px_rgba(56,189,248,0.45)]' },
  { name: 'Zombie',     cls: 'text-lime-500    border-lime-600/25    hover:border-lime-400/70    hover:text-lime-200    hover:shadow-[0_0_14px_rgba(132,204,22,0.45)]' },
  { name: 'Modern',     cls: 'text-gray-400    border-gray-600/25    hover:border-gray-400/70    hover:text-gray-200    hover:shadow-[0_0_14px_rgba(156,163,175,0.4)]' },
  { name: 'Cyberpunk',  cls: 'text-cyan-400    border-cyan-500/25    hover:border-cyan-400/70    hover:text-cyan-100    hover:shadow-[0_0_14px_rgba(34,211,238,0.55)]' },
  { name: 'Historical', cls: 'text-amber-500   border-amber-600/25   hover:border-amber-400/70   hover:text-amber-200   hover:shadow-[0_0_14px_rgba(251,191,36,0.45)]' },
  { name: 'Mixed',      cls: 'text-accent-gold border-accent-gold/25 hover:border-accent-gold/80 hover:text-yellow-200   hover:shadow-[0_0_14px_rgba(201,168,76,0.55)]' },
];

const FEATURES = [
  {
    icon: '⚄',
    title: 'd10 Resolution',
    desc: 'All rolls visible. DC 3–10. Crits & fumbles carry real weight.',
    hover: 'hover:border-accent-red/50 hover:shadow-glow-red hover:bg-accent-red/5',
    icon_cls: 'text-accent-red glow-red',
  },
  {
    icon: '◷',
    title: 'Living World',
    desc: 'Clocks tick. Factions move. Consequences echo across sessions.',
    hover: 'hover:border-accent-blue/50 hover:shadow-glow-blue hover:bg-accent-blue/5',
    icon_cls: 'text-accent-blue glow-blue',
  },
  {
    icon: '⊙',
    title: 'Local-First',
    desc: 'All data stays on your machine. IndexedDB. Zero cloud required.',
    hover: 'hover:border-accent-green/50 hover:shadow-glow-green hover:bg-accent-green/5',
    icon_cls: 'text-accent-green glow-green',
  },
  {
    icon: '⊞',
    title: 'Any Genre',
    desc: '7 genres. Infinite combinations. Seeded, deterministic worlds.',
    hover: 'hover:border-accent-purple/50 hover:shadow-glow-purple hover:bg-accent-purple/5',
    icon_cls: 'text-accent-purple glow-purple',
  },
];

export function HomeScreen() {
  const { setMode, openImportModal } = useUIStore();
  const { loadFromSaveState, startSetup } = useGameStore();
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    listAllSessions().then(setSessions).catch(() => {});
  }, []);

  // Typewriter loop
  useEffect(() => {
    const target = TAGLINES[taglineIdx];
    let i = 0;
    setDisplayed('');
    setTyping(true);
    const iv = setInterval(() => {
      i++;
      setDisplayed(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(iv);
        setTyping(false);
        const pause = setTimeout(
          () => setTaglineIdx((p) => (p + 1) % TAGLINES.length),
          3200
        );
        return () => clearTimeout(pause);
      }
    }, 28);
    return () => clearInterval(iv);
  }, [taglineIdx]);

  const handleNewGame = () => { startSetup(); setMode('setup'); };

  const handleLoadSession = async (meta: SessionMeta) => {
    const { loadGame } = await import('../lib/db');
    const state = await loadGame(meta.session_id, 'autosave');
    if (state) { loadFromSaveState(state); setMode('play'); }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full p-8 text-center overflow-hidden hex-bg">

      {/* ── Ambient blobs ───────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[120px] bg-accent-gold/[0.05] animate-orb" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] rounded-full blur-[100px] bg-accent-purple/[0.06] animate-orb [animation-delay:-4s]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[200px] rounded-full blur-[80px] bg-accent-blue/[0.04] animate-orb [animation-delay:-8s]" />
      </div>

      {/* ── Logo ───────────────────────── */}
      <div className="relative z-10 mb-8 animate-fade-in-up">
        <div className="relative inline-block">
          {/* Halo behind title */}
          <div className="absolute -inset-6 rounded-full blur-2xl bg-accent-gold/[0.08]" />
          <h1 className="relative font-mono text-6xl font-bold tracking-[0.25em] text-gradient-gold animate-flicker">
            USRE
          </h1>
        </div>
        <p className="text-[10px] text-muted uppercase tracking-[0.5em] mt-2 mb-5">
          Ultimate Sandbox RPG Engine
        </p>
        {/* Typewriter tagline */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-sm text-gray-400 max-w-md mx-auto italic">
            {displayed}
            {typing && <span className="animate-blink text-accent-gold">▋</span>}
          </p>
        </div>
      </div>

      {/* ── Genre badges ───────────────── */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2 mb-10 max-w-lg [animation-delay:0.1s] animate-fade-in-up">
        {GENRES.map((g) => (
          <span
            key={g.name}
            className={clsx(
              'text-[11px] font-medium px-3 py-1 rounded-full border cursor-default',
              'transition-all duration-250',
              g.cls
            )}
          >
            {g.name}
          </span>
        ))}
      </div>

      {/* ── CTA buttons ─────────────────── */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs mb-12 [animation-delay:0.15s] animate-fade-in-up">
        <button
          onClick={handleNewGame}
          className={clsx(
            'relative w-full py-3 px-6 rounded-md font-semibold text-surface-0 shimmer',
            'bg-accent-gold border border-accent-gold',
            'transition-all duration-200',
            'hover:shadow-[0_0_32px_rgba(201,168,76,0.5),0_0_64px_rgba(201,168,76,0.2)]',
            'hover:scale-[1.025] active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50'
          )}
        >
          New Session
        </button>
        <button
          onClick={openImportModal}
          className={clsx(
            'w-full py-2.5 px-6 rounded-md text-sm text-accent-gold shimmer',
            'border border-accent-gold/25 bg-accent-gold/5',
            'transition-all duration-200',
            'hover:border-accent-gold/60 hover:bg-accent-gold/10',
            'hover:shadow-[0_0_20px_rgba(201,168,76,0.2)]',
            'hover:scale-[1.015] active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/30'
          )}
        >
          Import Save JSON
        </button>
      </div>

      {/* ── Previous sessions ───────────── */}
      {sessions.length > 0 && (
        <div className="relative z-10 w-full max-w-sm mb-12 animate-fade-in-up [animation-delay:0.2s]">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-faint to-transparent" />
            <p className="text-[10px] text-muted uppercase tracking-wider">Continue a Session</p>
            <span className="h-px flex-1 bg-gradient-to-r from-faint via-faint to-transparent" />
          </div>
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 4).map((meta) => (
              <button
                key={meta.session_id}
                onClick={() => handleLoadSession(meta)}
                className={clsx(
                  'w-full text-left border border-faint rounded-lg p-3 shimmer',
                  'bg-surface-1/80 backdrop-blur-sm',
                  'transition-all duration-250',
                  'hover:border-accent-gold/40 hover:bg-surface-2',
                  'hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]',
                  'hover:translate-x-0.5 active:scale-[0.99]'
                )}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-sm font-medium text-gray-200">{meta.name}</span>
                  <span className="text-[10px] text-accent-gold font-mono bg-accent-gold/10 border border-accent-gold/20 px-1.5 py-0.5 rounded">
                    T{meta.turn}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-muted">
                  <span className="capitalize">{meta.genre}</span>
                  <span className="text-faint">·</span>
                  <span>{meta.archetype}</span>
                  <span className="text-faint">·</span>
                  <span>{new Date(meta.timestamp).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Feature cards ───────────────── */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl animate-fade-in-up [animation-delay:0.25s]">
        {FEATURES.map(({ icon, title, desc, hover, icon_cls }) => (
          <div
            key={title}
            className={clsx(
              'flex flex-col gap-2.5 p-4 text-xs text-center rounded-lg',
              'border border-faint bg-surface-1/60 backdrop-blur-sm',
              'transition-all duration-300 cursor-default',
              'hover:-translate-y-1.5',
              hover
            )}
          >
            <span className={clsx('text-2xl', icon_cls)}>{icon}</span>
            <span className="font-semibold text-gray-300 text-[11px] uppercase tracking-wider">{title}</span>
            <span className="text-gray-600 leading-relaxed">{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom divider ──────────────── */}
      <div className="relative z-10 mt-16 w-full max-w-sm">
        <div className="h-px bg-gradient-to-r from-transparent via-faint to-transparent" />
        <p className="text-[9px] text-muted/50 mt-3 tracking-widest uppercase">
          Local · Private · Seeded · Deterministic
        </p>
      </div>
    </div>
  );
}
