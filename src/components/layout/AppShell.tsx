'use client';

import type { ReactNode } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useGameStore } from '../../state/gameStore';
import { SidePanel } from './SidePanel';
import { JsonModal } from '../ui/JsonModal';
import { clsx } from 'clsx';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { sidePanelOpen, mode } = useUIStore();
  const isPlaying = mode === 'play';

  return (
    <div className="flex h-screen w-full bg-surface-0 text-gray-100 overflow-hidden font-sans">
      {/* Main content area */}
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-200',
          isPlaying && sidePanelOpen ? 'mr-[320px] lg:mr-[380px]' : ''
        )}
      >
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 h-10 bg-surface-1/95 border-b border-faint shrink-0 backdrop-blur-sm relative">
          {/* Subtle gold underline glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3">
            <span className="text-accent-gold font-mono text-sm font-bold tracking-widest glow-gold-sm animate-flicker">
              USRE
            </span>
            <span className="text-faint text-xs">│</span>
            <span className="text-[10px] text-muted uppercase tracking-[0.2em]">
              Ultimate Sandbox RPG Engine
            </span>
            {isPlaying && <span className="status-dot ml-1" />}
          </div>
          {isPlaying && <TopBarControls />}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Side panel (only during play) */}
      {isPlaying && sidePanelOpen && <SidePanel />}

      {/* Global modals */}
      <JsonModal />
    </div>
  );
}

function TopBarControls() {
  const { toggleSidePanel, sidePanelOpen, openImportModal, openExportModal } = useUIStore();
  const buildSaveState = useGameStore((s) => s.buildSaveState);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => {
          const state = buildSaveState();
          if (state) openExportModal(JSON.stringify(state, null, 2));
        }}
        className="text-[11px] text-muted hover:text-gray-200 transition-all duration-150 px-2 py-1 rounded hover:bg-surface-3 hover:shadow-[0_0_8px_rgba(201,168,76,0.1)]"
      >
        Export
      </button>
      <button
        onClick={openImportModal}
        className="text-[11px] text-muted hover:text-gray-200 transition-all duration-150 px-2 py-1 rounded hover:bg-surface-3"
      >
        Import
      </button>
      <div className="w-px h-4 bg-faint mx-1" />
      <button
        onClick={toggleSidePanel}
        className={clsx(
          'text-[11px] transition-all duration-200 px-2.5 py-1 rounded border shimmer',
          sidePanelOpen
            ? 'text-accent-gold border-accent-gold/40 bg-accent-gold/10 shadow-[0_0_12px_rgba(201,168,76,0.15)]'
            : 'text-muted border-faint hover:text-gray-200 hover:border-gray-500/50 hover:bg-surface-3'
        )}
      >
        {sidePanelOpen ? '◀ Panel' : '▶ Panel'}
      </button>
    </div>
  );
}

