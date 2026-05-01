import type { Tracks, GameConfig, Weather, Stats } from '../types';

// ─── Decay Rates (per turn) ───────────────────────────────────

const DECAY_RATES: Record<string, number> = {
  hunger: 1,
  thirst: 1.5,
  temperature: 0,   // temperature changes via weather, not time
  fatigue: 0.5,
  radiation: 0,     // radiation persists, cleared by treatment
  disease: 0.3,
};

// ─── Tick ─────────────────────────────────────────────────────

export function tickSurvival(
  tracks: Tracks,
  config: GameConfig,
  turnsPassed = 1
): {
  tracks: Tracks;
  alerts: string[];
  penalties: Partial<Stats>;
} {
  if (!config.survivalEnabled) {
    return { tracks, alerts: [], penalties: {} };
  }

  const updated = { ...tracks };
  const alerts: string[] = [];
  const penalties: Partial<Stats> = {};

  const meterKeys: Array<keyof Tracks> = [
    'hunger', 'thirst', 'temperature', 'fatigue', 'radiation', 'disease',
  ];

  for (const key of meterKeys) {
    const track = updated[key];
    if (!track || !config.survivalMeters.some((m) => (m as string) === key)) continue;

    const decay = (DECAY_RATES[key] ?? 0) * turnsPassed;
    const newCurrent = Math.max(0, track.current - decay);
    updated[key] = { ...track, current: newCurrent };

    const pct = newCurrent / (track.max || 1);
    if (newCurrent <= 0) {
      alerts.push(`CRITICAL: ${track.label} depleted!`);
      // Severe penalty
      if (key === 'hunger' || key === 'thirst') {
        penalties.endurance = (penalties.endurance ?? 0) - 2;
        penalties.strength = (penalties.strength ?? 0) - 1;
      }
      if (key === 'fatigue') {
        penalties.agility = (penalties.agility ?? 0) - 2;
        penalties.perception = (penalties.perception ?? 0) - 1;
      }
      if (key === 'disease' || key === 'radiation') {
        penalties.endurance = (penalties.endurance ?? 0) - 2;
      }
    } else if (pct < 0.2) {
      alerts.push(`Warning: ${track.label} critically low (${Math.round(newCurrent)}/${track.max}).`);
      if (key === 'hunger') penalties.strength = (penalties.strength ?? 0) - 1;
      if (key === 'thirst') penalties.endurance = (penalties.endurance ?? 0) - 1;
      if (key === 'fatigue') penalties.agility = (penalties.agility ?? 0) - 1;
    }
  }

  return { tracks: updated, alerts, penalties };
}

// ─── Critical Check ───────────────────────────────────────────

export function survivalCritical(tracks: Tracks): boolean {
  const keys: Array<keyof Tracks> = [
    'hunger', 'thirst', 'temperature', 'fatigue', 'radiation', 'disease',
  ];
  return keys.some((k) => {
    const t = tracks[k];
    return t !== undefined && t.current <= 0;
  });
}

// ─── Consumption ──────────────────────────────────────────────

export function eatFood(tracks: Tracks, amount: number): Tracks {
  if (!tracks.hunger) return tracks;
  return {
    ...tracks,
    hunger: {
      ...tracks.hunger,
      current: Math.min(tracks.hunger.max, tracks.hunger.current + amount),
    },
  };
}

export function drinkWater(tracks: Tracks, amount: number): Tracks {
  if (!tracks.thirst) return tracks;
  return {
    ...tracks,
    thirst: {
      ...tracks.thirst,
      current: Math.min(tracks.thirst.max, tracks.thirst.current + amount),
    },
  };
}

// ─── Rest ─────────────────────────────────────────────────────

export function rest(tracks: Tracks, hours: number, _config: GameConfig): Tracks {
  const updated = { ...tracks };

  // Restore fatigue
  if (updated.fatigue) {
    updated.fatigue = {
      ...updated.fatigue,
      current: Math.min(updated.fatigue.max, updated.fatigue.current + hours * 3),
    };
  }

  // Restore HP (slow)
  updated.hp = {
    ...updated.hp,
    current: Math.min(updated.hp.max, updated.hp.current + Math.ceil(hours / 4)),
  };

  // Restore stamina
  updated.stamina = {
    ...updated.stamina,
    current: Math.min(updated.stamina.max, updated.stamina.current + hours * 2),
  };

  // Restore mana/psi
  if (updated.mana) {
    updated.mana = {
      ...updated.mana,
      current: Math.min(updated.mana.max, updated.mana.current + hours * 2),
    };
  }
  if (updated.psi) {
    updated.psi = {
      ...updated.psi,
      current: Math.min(updated.psi.max, updated.psi.current + hours),
    };
  }

  return updated;
}

// ─── Weather Effects ──────────────────────────────────────────

export function weatherEffect(
  tracks: Tracks,
  weather: Weather,
  _config: GameConfig
): Tracks {
  if (!tracks.temperature || weather.severity < 2) return tracks;

  const delta = weather.current === 'blizzard' || weather.current === 'extreme cold'
    ? -weather.severity * 2
    : weather.current === 'heat wave'
    ? -weather.severity
    : 0;

  if (delta === 0) return tracks;

  return {
    ...tracks,
    temperature: {
      ...tracks.temperature,
      current: Math.max(0, Math.min(tracks.temperature.max, tracks.temperature.current + delta)),
    },
  };
}

// ─── Status Format ────────────────────────────────────────────

export function formatSurvivalStatus(tracks: Tracks): string {
  const parts: string[] = [
    `HP ${tracks.hp.current}/${tracks.hp.max}`,
  ];

  if (tracks.stamina) parts.push(`Stam ${tracks.stamina.current}/${tracks.stamina.max}`);
  if (tracks.hunger) parts.push(`Hung ${Math.round(tracks.hunger.current)}/${tracks.hunger.max}`);
  if (tracks.thirst) parts.push(`Thst ${Math.round(tracks.thirst.current)}/${tracks.thirst.max}`);
  if (tracks.fatigue) parts.push(`Fat ${Math.round(tracks.fatigue.current)}/${tracks.fatigue.max}`);
  if (tracks.radiation && tracks.radiation.current > 0) {
    parts.push(`Rad ${Math.round(tracks.radiation.current)}/${tracks.radiation.max}`);
  }
  if (tracks.disease && tracks.disease.current < tracks.disease.max) {
    parts.push(`Dis ${Math.round(tracks.disease.current)}/${tracks.disease.max}`);
  }

  return parts.join(' | ');
}
