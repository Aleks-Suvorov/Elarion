import { create } from 'zustand';
import type { UIState, AppMode, SidePanelTab } from '../types';

interface UIStore extends UIState {
  setMode(mode: AppMode): void;
  setSidePanelTab(tab: SidePanelTab): void;
  toggleSidePanel(): void;
  setSidePanelOpen(open: boolean): void;
  openExportModal(content: string): void;
  openImportModal(): void;
  closeJsonModal(): void;
  setJsonContent(content: string): void;
  toggleRollLog(): void;
  setError(message: string | null): void;
  clearError(): void;
}

export const useUIStore = create<UIStore>((set) => ({
  mode: 'home',
  sidePanelTab: 'sheet',
  sidePanelOpen: false,
  jsonModalOpen: false,
  jsonModalContent: '',
  jsonModalMode: 'export',
  rollLogOpen: false,
  settingsOpen: false,
  errorMessage: null,

  setMode: (mode) => set({ mode }),

  setSidePanelTab: (tab) => set({ sidePanelTab: tab, sidePanelOpen: true }),

  toggleSidePanel: () => set((s) => ({ sidePanelOpen: !s.sidePanelOpen })),

  setSidePanelOpen: (open) => set({ sidePanelOpen: open }),

  openExportModal: (content) =>
    set({ jsonModalOpen: true, jsonModalContent: content, jsonModalMode: 'export' }),

  openImportModal: () =>
    set({ jsonModalOpen: true, jsonModalContent: '', jsonModalMode: 'import' }),

  closeJsonModal: () => set({ jsonModalOpen: false, jsonModalContent: '' }),

  setJsonContent: (content) => set({ jsonModalContent: content }),

  toggleRollLog: () => set((s) => ({ rollLogOpen: !s.rollLogOpen })),

  setError: (message) => set({ errorMessage: message }),

  clearError: () => set({ errorMessage: null }),
}));
