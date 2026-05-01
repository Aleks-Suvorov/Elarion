'use client';

import { useGameStore } from '../../state/gameStore';
import { TrackBar, MultiTrack } from '../ui/TrackBar';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';
import type { Stats, Track } from '../../types';
import { statMod } from '../../engine/dice';

const STAT_LABELS: Array<{ key: keyof Stats; label: string }> = [
  { key: 'strength', label: 'STR' },
  { key: 'agility', label: 'AGI' },
  { key: 'endurance', label: 'END' },
  { key: 'perception', label: 'PER' },
  { key: 'intellect', label: 'INT' },
  { key: 'willpower', label: 'WIL' },
  { key: 'charisma', label: 'CHA' },
  { key: 'luck', label: 'LCK' },
  { key: 'tech', label: 'TEC' },
  { key: 'magic', label: 'MAG' },
  { key: 'psionics', label: 'PSI' },
];

export function CharacterSheet() {
  const character = useGameStore((s) => s.character);
  const config = useGameStore((s) => s.config);
  const turn = useGameStore((s) => s.turn);

  if (!character) {
    return (
      <p className="text-xs text-muted italic text-center py-8">
        No character loaded.
      </p>
    );
  }

  const relevantStats = STAT_LABELS.filter(({ key }) => {
    if (key === 'tech' && (!config || config.techLevel === 0)) return false;
    if (key === 'magic' && (!config || config.magicLevel === 0)) return false;
    if (key === 'psionics' && (!config || config.supernaturalLevel === 0)) return false;
    const val = character.stats[key];
    return val !== undefined && val > 0;
  });

  const coreTracks: Track[] = [
    character.tracks.hp,
    character.tracks.stamina,
    ...(character.tracks.mana ? [character.tracks.mana] : []),
    ...(character.tracks.psi ? [character.tracks.psi] : []),
  ];

  const survivalTracks: Track[] = [
    ...(character.tracks.hunger ? [character.tracks.hunger] : []),
    ...(character.tracks.thirst ? [character.tracks.thirst] : []),
    ...(character.tracks.temperature ? [character.tracks.temperature] : []),
    ...(character.tracks.fatigue ? [character.tracks.fatigue] : []),
    ...(character.tracks.radiation ? [character.tracks.radiation] : []),
    ...(character.tracks.disease ? [character.tracks.disease] : []),
  ];

  const xpPct =
    character.xpToNext > 0
      ? Math.min(1, character.xp / character.xpToNext)
      : 0;

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Identity */}
      <div>
        <h2 className="text-base font-bold text-gray-100">{character.name}</h2>
        <p className="text-accent-gold-dim">{character.archetype}</p>
        <p className="text-muted">{character.species}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="gold">Lv {character.level}</Badge>
          <Badge variant="muted">Turn {turn}</Badge>
        </div>
      </div>

      {/* XP bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-muted uppercase tracking-wider text-[10px]">Experience</span>
          <span className="tabular-nums text-gray-400">{character.xp} / {character.xpToNext}</span>
        </div>
        <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-purple rounded-full transition-all duration-300"
            style={{ width: `${xpPct * 100}%` }}
          />
        </div>
      </div>

      {/* Core tracks */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Vitals</p>
        <MultiTrack tracks={coreTracks} size="md" />
      </section>

      {/* Survival tracks */}
      {survivalTracks.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Survival</p>
          <MultiTrack tracks={survivalTracks} size="sm" />
        </section>
      )}

      {/* Stats grid */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Stats</p>
        <div className="grid grid-cols-4 gap-1.5">
          {relevantStats.map(({ key, label }) => {
            const val = character.stats[key] ?? 0;
            const mod = statMod(val);
            return (
              <div
                key={key}
                className="flex flex-col items-center bg-surface-2 rounded border border-faint p-1.5"
              >
                <span className="text-[10px] text-muted">{label}</span>
                <span className="text-sm font-bold text-gray-100 tabular-nums">{val}</span>
                <span
                  className={clsx(
                    'text-[9px] tabular-nums',
                    mod > 0 ? 'text-accent-green' : mod < 0 ? 'text-accent-red' : 'text-muted'
                  )}
                >
                  {mod >= 0 ? `+${mod}` : `${mod}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      {Object.keys(character.skills).length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-col gap-1">
            {Object.entries(character.skills).map(([skill, rank]) => (
              <div key={skill} className="flex justify-between items-center">
                <span className="text-gray-400">{skill}</span>
                <span className="tabular-nums text-accent-gold">+{rank}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Abilities */}
      {character.abilities.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Abilities</p>
          <div className="flex flex-col gap-2">
            {character.abilities.map((ab) => (
              <div key={ab.id} className="bg-surface-2 rounded border border-faint p-2">
                <p className="font-semibold text-gray-200">{ab.name}</p>
                {ab.cost && <p className="text-muted">{ab.cost}</p>}
                <p className="text-gray-500 mt-0.5 leading-relaxed">{ab.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Traits */}
      {character.traits.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Traits</p>
          <div className="flex flex-col gap-1.5">
            {character.traits.map((t) => (
              <div key={t.id} className="flex flex-col">
                <span className="text-gray-300 font-medium">{t.name}</span>
                <span className="text-gray-500 leading-relaxed">{t.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reputation */}
      {Object.keys(character.reputation).length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Reputation</p>
          <div className="flex flex-col gap-1">
            {Object.entries(character.reputation).map(([faction, rep]) => (
              <div key={faction} className="flex justify-between items-center">
                <span className="text-gray-400">{faction}</span>
                <Badge variant={rep >= 0 ? 'green' : 'red'}>{rep >= 0 ? `+${rep}` : rep}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {character.notes && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Notes</p>
          <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{character.notes}</p>
        </section>
      )}
    </div>
  );
}
