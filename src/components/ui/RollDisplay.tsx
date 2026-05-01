'use client';

import { clsx } from 'clsx';
import type { RollResult } from '../../types';

interface RollDisplayProps {
  roll: RollResult;
  compact?: boolean;
  className?: string;
}

export function RollDisplay({ roll, compact = false, className }: RollDisplayProps) {
  if (compact) {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded border',
          roll.isAutoSuccess
            ? 'text-accent-blue border-accent-blue/30 bg-accent-blue/10'
            : roll.success
            ? 'text-accent-green border-accent-green/30 bg-accent-green/10'
            : 'text-accent-red border-accent-red/30 bg-accent-red/10',
          className
        )}
      >
        {roll.isAutoSuccess ? '⚡' : roll.isCrit ? '🎯' : roll.isFumble ? '💀' : roll.success ? '✓' : '✗'}
        {' '}
        {roll.breakdown}
      </span>
    );
  }

  return (
    <div
      className={clsx(
        'rounded border p-3 font-mono text-sm',
        roll.isAutoSuccess
          ? 'border-accent-blue/40 bg-accent-blue/5'
          : roll.success
          ? 'border-accent-green/40 bg-accent-green/5'
          : 'border-accent-red/40 bg-accent-red/5',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">
          {roll.isAutoSuccess ? '⚡' : roll.isCrit ? '🎯' : roll.isFumble ? '💀' : roll.success ? '✓' : '✗'}
        </span>
        <span
          className={clsx(
            'text-xs font-sans font-semibold uppercase tracking-wider',
            roll.isCrit
              ? 'text-accent-gold'
              : roll.isFumble
              ? 'text-accent-red'
              : roll.success
              ? 'text-accent-green'
              : 'text-accent-red'
          )}
        >
          {roll.isAutoSuccess
            ? 'Auto-Success'
            : roll.isCrit
            ? 'Critical!'
            : roll.isFumble
            ? 'Fumble!'
            : roll.success
            ? 'Success'
            : 'Failure'}
        </span>
      </div>

      <p className="text-gray-300 text-xs leading-relaxed">{roll.breakdown}</p>

      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        {roll.statUsed && <span>Stat: {roll.statUsed}</span>}
        {roll.skillUsed && <span>Skill: {roll.skillUsed}</span>}
        <span>Turn {roll.turn}</span>
      </div>
    </div>
  );
}

interface RollLogProps {
  rolls: RollResult[];
  maxVisible?: number;
  className?: string;
}

export function RollLog({ rolls, maxVisible = 20, className }: RollLogProps) {
  const visible = rolls.slice(0, maxVisible);

  if (visible.length === 0) {
    return (
      <p className="text-xs text-muted italic text-center py-4">No rolls yet.</p>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {visible.map((roll, i) => (
        <RollDisplay key={`${roll.timestamp}-${i}`} roll={roll} compact />
      ))}
    </div>
  );
}
