'use client';

import { clsx } from 'clsx';
import type { Clock } from '../../types';

interface ClockDisplayProps {
  clock: Clock;
  className?: string;
  compact?: boolean;
}

const categoryColors: Record<Clock['category'], string> = {
  threat: 'border-accent-red/60 bg-accent-red/5',
  opportunity: 'border-accent-green/60 bg-accent-green/5',
  event: 'border-accent-blue/60 bg-accent-blue/5',
  personal: 'border-accent-purple/60 bg-accent-purple/5',
};

const categoryDotColors: Record<Clock['category'], string> = {
  threat: 'bg-accent-red',
  opportunity: 'bg-accent-green',
  event: 'bg-accent-blue',
  personal: 'bg-accent-purple',
};

export function ClockDisplay({ clock, className, compact = false }: ClockDisplayProps) {
  const pct = clock.maxTicks > 0 ? clock.ticks / clock.maxTicks : 0;
  const isUrgent = pct >= 0.75;
  const isComplete = clock.ticks >= clock.maxTicks;

  return (
    <div
      className={clsx(
        'border rounded p-2.5',
        categoryColors[clock.category],
        isComplete && 'opacity-60',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-gray-200 truncate">
          {clock.name}
        </span>
        <span
          className={clsx(
            'text-xs tabular-nums font-mono shrink-0',
            isUrgent ? 'text-accent-red' : 'text-gray-400'
          )}
        >
          {clock.ticks}/{clock.maxTicks}
        </span>
      </div>

      {/* Segmented clock display */}
      <div className="flex gap-1 mb-1.5">
        {Array.from({ length: clock.maxTicks }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'flex-1 h-3 rounded-sm border',
              i < clock.ticks
                ? clsx(categoryDotColors[clock.category], 'border-transparent')
                : 'bg-surface-2 border-faint'
            )}
          />
        ))}
      </div>

      {!compact && (
        <p className="text-xs text-gray-500 leading-relaxed">{clock.description}</p>
      )}

      {isComplete && (
        <p className="text-xs text-accent-red font-semibold mt-1">
          ⚡ {clock.onComplete}
        </p>
      )}
    </div>
  );
}
