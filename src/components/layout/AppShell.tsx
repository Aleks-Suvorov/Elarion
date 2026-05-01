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
        <header className="flex items-center justify-between px-4 h-10 bg-surface-1 border-b border-faint shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-accent-gold font-mono text-sm font-bold tracking-widest">
              USRE
            </span>
            <span className="text-faint">|</span>
            <span className="text-xs text-muted uppercase tracking-wider">
              Ultimate Sandbox RPG Engine
            </span>
          </div>
          {isPlaying && (
            <TopBarControls />
          )}
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
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const state = buildSaveState();
          if (state) openExportModal(JSON.stringify(state, null, 2));
        }}
        className="text-xs text-muted hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-surface-2"
      >
        Export
      </button>
      <button
        onClick={openImportModal}
        className="text-xs text-muted hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-surface-2"
      >
        Import
      </button>
      <button
        onClick={toggleSidePanel}
        className={clsx(
          'text-xs transition-colors px-2.5 py-1 rounded border',
          sidePanelOpen
            ? 'text-accent-gold border-accent-gold/40 bg-accent-gold/10'
            : 'text-muted border-faint hover:text-gray-300 hover:bg-surface-2'
        )}
      >
        {sidePanelOpen ? '◀ Panel' : '▶ Panel'}
      </button>
    </div>
  );
}

