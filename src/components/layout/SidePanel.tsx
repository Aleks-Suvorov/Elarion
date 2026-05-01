'use client';

import { clsx } from 'clsx';
import { useUIStore } from '../../state/uiStore';
import type { SidePanelTab } from '../../types';
import { CharacterSheet } from '../panels/CharacterSheet';
import { InventoryPanel } from '../panels/InventoryPanel';
import { QuestPanel } from '../panels/QuestPanel';
import { NPCPanel } from '../panels/NPCPanel';
import { FactionPanel } from '../panels/FactionPanel';
import { ClockPanel } from '../panels/ClockPanel';
import { WorldPanel } from '../panels/WorldPanel';
import { SavesPanel } from '../panels/SavesPanel';

const TABS: Array<{ id: SidePanelTab; label: string; icon: string }> = [
  { id: 'sheet', label: 'Sheet', icon: '⚔' },
  { id: 'inventory', label: 'Inv', icon: '⊞' },
  { id: 'quests', label: 'Quests', icon: '◎' },
  { id: 'npcs', label: 'NPCs', icon: '◈' },
  { id: 'factions', label: 'Factions', icon: '⬡' },
  { id: 'clocks', label: 'Clocks', icon: '◷' },
  { id: 'world', label: 'World', icon: '⊕' },
  { id: 'saves', label: 'Saves', icon: '⊙' },
];

export function SidePanel() {
  const { sidePanelTab, setSidePanelTab } = useUIStore();

  return (
    <div className="fixed right-0 top-10 bottom-0 w-[320px] lg:w-[380px] bg-surface-1 border-l border-faint flex flex-col z-30">
      {/* Tab bar */}
      <div className="flex overflow-x-auto shrink-0 border-b border-faint">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidePanelTab(tab.id)}
            className={clsx(
              'flex-1 min-w-0 flex flex-col items-center py-2 px-1 text-[10px] font-medium transition-colors border-b-2',
              sidePanelTab === tab.id
                ? 'border-accent-gold text-accent-gold bg-accent-gold/5'
                : 'border-transparent text-muted hover:text-gray-300 hover:bg-surface-2'
            )}
          >
            <span className="text-sm leading-none mb-0.5">{tab.icon}</span>
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {sidePanelTab === 'sheet' && <CharacterSheet />}
        {sidePanelTab === 'inventory' && <InventoryPanel />}
        {sidePanelTab === 'quests' && <QuestPanel />}
        {sidePanelTab === 'npcs' && <NPCPanel />}
        {sidePanelTab === 'factions' && <FactionPanel />}
        {sidePanelTab === 'clocks' && <ClockPanel />}
        {sidePanelTab === 'world' && <WorldPanel />}
        {sidePanelTab === 'saves' && <SavesPanel />}
      </div>
    </div>
  );
}
