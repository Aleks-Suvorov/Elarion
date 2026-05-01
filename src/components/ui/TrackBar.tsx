'use client';

import { clsx } from 'clsx';
import type { Track } from '../../types';

interface TrackBarProps {
  track: Track;
  showLabel?: boolean;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function colorClass(pct: number, color?: string): string {
  if (color) return color;
  if (pct > 0.6) return 'bg-accent-green';
  if (pct > 0.3) return 'bg-accent-gold';
  return 'bg-accent-red';
}

const heights: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function TrackBar({
  track,
  showLabel = true,
  showNumbers = true,
  size = 'md',
  className,
}: TrackBarProps) {
  const pct = track.max > 0 ? Math.max(0, Math.min(1, track.current / track.max)) : 0;

  return (
    <div className={clsx('flex flex-col gap-0.5', className)}>
      {(showLabel || showNumbers) && (
        <div className="flex justify-between items-baseline text-xs">
          {showLabel && (
            <span className="text-gray-400 font-medium">{track.label}</span>
          )}
          {showNumbers && (
            <span className="tabular-nums text-gray-300">
              {track.current}/{track.max}
            </span>
          )}
        </div>
      )}
      <div className={clsx('w-full rounded-full bg-surface-3 overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            colorClass(pct, track.color)
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

interface MultiTrackProps {
  tracks: Track[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MultiTrack({ tracks, size = 'sm', className }: MultiTrackProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {tracks.map((t) => (
        <TrackBar key={t.label} track={t} size={size} />
      ))}
    </div>
  );
}
