'use client';

import { useEffect } from 'react';
import { useUIStore } from '../state/uiStore';
import { useGameStore } from '../state/gameStore';
import { AppShell } from '../components/layout/AppShell';
import { SetupWizard } from '../components/setup/SetupWizard';
import { PlayInterface } from '../components/play/PlayInterface';
import { HomeScreen } from '../components/HomeScreen';

export default function Home() {
  const mode = useUIStore((s) => s.mode);

  return (
    <AppShell>
      {mode === 'home' && <HomeScreen />}
      {mode === 'setup' && <SetupWizard />}
      {mode === 'play' && <PlayInterface />}
    </AppShell>
  );
}
