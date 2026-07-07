'use client';

import { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TrackBar } from '../ui/TrackBar';
import { clsx } from 'clsx';
import type { GameConfig, Stats, StatKey, SpeciesTemplate, ArchetypeTemplate } from '../../types';
import {
  SPECIES_TEMPLATES,
  buildCharacter,
  applySpeciesModifiers,
  defaultStats,
  buildTracks,
  computeMaxHP,
  computeMaxStamina,
} from '../../engine/character';
import { archetypesForGenre, matchArchetype } from '../../data/archetypes';
import { adjustedStatBudget } from '../../engine/setup';
import { statMod } from '../../engine/dice';

const STAT_LABELS: Array<{ key: StatKey; label: string; desc: string }> = [
  { key: 'strength', label: 'STR', desc: 'Melee damage, lifting, physical power' },
  { key: 'agility', label: 'AGI', desc: 'Speed, dodging, stealth, ranged accuracy' },
  { key: 'endurance', label: 'END', desc: 'HP, stamina, pain tolerance, survival' },
  { key: 'perception', label: 'PER', desc: 'Spotting threats, reading situations' },
  { key: 'intellect', label: 'INT', desc: 'Problem-solving, knowledge, crafting' },
  { key: 'willpower', label: 'WIL', desc: 'Mental resistance, magic control, grit' },
  { key: 'charisma', label: 'CHA', desc: 'Persuasion, leadership, social influence' },
  { key: 'luck', label: 'LCK', desc: 'Random event bias, avoiding worst outcomes' },
];

type Step = 'name' | 'species' | 'archetype' | 'stats' | 'backstory' | 'review';

interface Props {
  config: GameConfig;
  onDone: () => void;
}

export function CharCreationWizard({ config, onDone }: Props) {
  const { finalizeCharacter } = useGameStore();

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<SpeciesTemplate | null>(null);
  const [archetype, setArchetype] = useState<ArchetypeTemplate | null>(null);
  const [stats, setStats] = useState<Stats>(defaultStats());
  const [backstory, setBackstory] = useState('');
  const [appearance, setAppearance] = useState('');

  const budget = adjustedStatBudget(config.statBudget, config.startingPowerLevel);
  const basePoints = 3;
  const spent = Object.values(stats).reduce<number>((sum, v) => sum + Math.max(0, (v ?? 0) - basePoints), 0);
  const remaining = budget - spent;

  const validSpecies = SPECIES_TEMPLATES.filter(
    (s) => s.genres.includes(config.genre) || s.genres.includes('mixed' as never)
  );
  const validArchetypes = [
    ...archetypesForGenre(config.genre),
    matchArchetype(config.archetypeTagline, config.genre),
  ].filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  const adjustStat = (key: StatKey, delta: number) => {
    const current = stats[key] ?? basePoints;
    const next = current + delta;
    if (next < 1 || next > 10) return;
    if (delta > 0 && remaining <= 0) return;
    setStats((s) => ({ ...s, [key]: next }));
  };

  const handleFinish = () => {
    if (!species || !archetype) return;
    const finalStats = applySpeciesModifiers(stats, species);
    const character = buildCharacter({
      name: name.trim() || 'Unknown',
      archetype,
      species,
      stats: finalStats,
      config,
      level: 1,
    });
    finalizeCharacter({ ...character, backstory, appearance });
    onDone();
  };

  const steps: Step[] = ['name', 'species', 'archetype', 'stats', 'backstory', 'review'];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Character Creation</span>
          <span className="capitalize">{step}</span>
        </div>
        <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-purple transition-all duration-300 rounded-full"
            style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full bg-surface-1 border border-faint rounded-lg p-6 animate-slide-in">
        {/* NAME */}
        {step === 'name' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-100 font-semibold">What is your character's name?</h2>
            <p className="text-xs text-muted">Archetype tagline: <span className="text-accent-gold">{config.archetypeTagline}</span></p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('species')}
              autoFocus
              className="bg-surface-0 border border-faint rounded px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-accent-gold-dim"
              placeholder="Character name…"
            />
            <Button variant="primary" onClick={() => setStep('species')} disabled={!name.trim()}>
              Continue →
            </Button>
          </div>
        )}

        {/* SPECIES */}
        {step === 'species' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-100 font-semibold">Choose your species</h2>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {validSpecies.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSpecies(s)}
                  className={clsx(
                    'text-left border rounded p-3 transition-colors',
                    species?.id === s.id
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-faint bg-surface-2 hover:border-gray-500'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-100 text-sm">{s.name}</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {Object.entries(s.statModifiers).map(([k, v]) => (
                        <Badge key={k} variant={v > 0 ? 'green' : 'red'} className="text-[10px]">
                          {k.slice(0, 3).toUpperCase()} {v > 0 ? `+${v}` : v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('name')}>← Back</Button>
              <Button variant="primary" onClick={() => setStep('archetype')} disabled={!species} className="flex-1">Continue →</Button>
            </div>
          </div>
        )}

        {/* ARCHETYPE */}
        {step === 'archetype' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-100 font-semibold">Choose your archetype</h2>
            <p className="text-xs text-muted">Your tagline "{config.archetypeTagline}" suggests these archetypes.</p>
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
              {validArchetypes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArchetype(a)}
                  className={clsx(
                    'text-left border rounded p-3 transition-colors',
                    archetype?.id === a.id
                      ? 'border-accent-gold bg-accent-gold/10'
                      : 'border-faint bg-surface-2 hover:border-gray-500'
                  )}
                >
                  <p className="font-medium text-gray-100 text-sm">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {a.startingAbilities.map((ab) => (
                      <Badge key={ab.id} variant="blue" className="text-[10px]">{ab.name}</Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('species')}>← Back</Button>
              <Button variant="primary" onClick={() => setStep('stats')} disabled={!archetype} className="flex-1">Continue →</Button>
            </div>
          </div>
        )}

        {/* STATS */}
        {step === 'stats' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-gray-100 font-semibold">Allocate Stats</h2>
              <Badge variant={remaining < 0 ? 'red' : remaining === 0 ? 'green' : 'gold'}>
                {remaining} pts remaining
              </Badge>
            </div>
            <p className="text-xs text-muted">Base: 3 per stat. Budget: {budget} pts. Max: 10.</p>
            <div className="flex flex-col gap-2">
              {STAT_LABELS.map(({ key, label, desc }) => {
                const val = stats[key] ?? basePoints;
                const mod = statMod(val);
                return (
                  <div key={key} className="flex items-center gap-3 bg-surface-2 border border-faint rounded p-2">
                    <span className="w-8 text-xs font-mono text-muted">{label}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 truncate">{desc}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => adjustStat(key, -1)}
                        disabled={val <= 1}
                        className="w-6 h-6 rounded bg-surface-3 text-gray-300 hover:bg-surface-4 disabled:opacity-30 text-sm flex items-center justify-center"
                      >−</button>
                      <span className="w-6 text-center font-bold text-gray-100 tabular-nums">{val}</span>
                      <button
                        onClick={() => adjustStat(key, 1)}
                        disabled={val >= 10 || remaining <= 0}
                        className="w-6 h-6 rounded bg-surface-3 text-gray-300 hover:bg-surface-4 disabled:opacity-30 text-sm flex items-center justify-center"
                      >+</button>
                      <span className={clsx('w-8 text-xs text-right tabular-nums', mod > 0 ? 'text-accent-green' : mod < 0 ? 'text-accent-red' : 'text-muted')}>
                        {mod >= 0 ? `+${mod}` : mod}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('archetype')}>← Back</Button>
              <Button variant="primary" onClick={() => setStep('backstory')} className="flex-1">Continue →</Button>
            </div>
          </div>
        )}

        {/* BACKSTORY */}
        {step === 'backstory' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-100 font-semibold">Backstory & Appearance</h2>
            <p className="text-xs text-muted">Optional — skip freely. A few sentences is enough.</p>
            <textarea
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className="bg-surface-0 border border-faint rounded px-3 py-2 text-sm text-gray-300 resize-none h-24 focus:outline-none focus:border-accent-gold-dim"
              placeholder="Brief backstory — who are you and how did you get here?"
            />
            <textarea
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              className="bg-surface-0 border border-faint rounded px-3 py-2 text-sm text-gray-300 resize-none h-16 focus:outline-none focus:border-accent-gold-dim"
              placeholder="Appearance — what do others see?"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('stats')}>← Back</Button>
              <Button variant="primary" onClick={() => setStep('review')} className="flex-1">Review →</Button>
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && species && archetype && (
          <div className="flex flex-col gap-4">
            <h2 className="text-gray-100 font-semibold">Review Character</h2>
            <div className="bg-surface-0 border border-faint rounded p-3 text-xs space-y-1.5">
              {(() => {
                const finalStats = applySpeciesModifiers(stats, species);
                return (
                  <>
              <p><span className="text-muted">Name:</span> <span className="text-gray-100 font-semibold">{name || 'Unnamed'}</span></p>
              <p><span className="text-muted">Species:</span> <span className="text-gray-300">{species.name}</span></p>
              <p><span className="text-muted">Archetype:</span> <span className="text-gray-300">{archetype.name}</span></p>
              <p><span className="text-muted">HP:</span> <span className="text-accent-green">{computeMaxHP(finalStats, 1)}</span></p>
              <p><span className="text-muted">Stamina:</span> <span className="text-accent-blue">{computeMaxStamina(finalStats)}</span></p>
              <div className="pt-1 grid grid-cols-4 gap-1">
                {STAT_LABELS.map(({ key, label }) => {
                  const val = finalStats[key] ?? stats[key] ?? 3;
                  return (
                    <div key={key} className="text-center">
                      <p className="text-muted">{label}</p>
                      <p className="text-gray-100 font-bold">{val}</p>
                    </div>
                  );
                })}
              </div>
              {backstory && <p className="pt-1"><span className="text-muted">Backstory:</span> <span className="text-gray-400">{backstory.slice(0, 100)}</span></p>}
                  </>
                );
              })()}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('backstory')}>← Back</Button>
              <Button variant="primary" onClick={handleFinish} className="flex-1">
                Begin Adventure →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
