'use client';

import { useGameStore } from '../../state/gameStore';
import { Badge } from '../ui/Badge';
import { formatTime } from '../../engine/worldSim';
import { clsx } from 'clsx';

export function WorldPanel() {
  const world = useGameStore((s) => s.world);
  const location = useGameStore((s) => s.location);
  const config = useGameStore((s) => s.config);

  if (!world) return <p className="text-xs text-muted italic text-center py-8">No world loaded.</p>;

  const currentRegion = world.regions.find((r) => r.id === location?.regionId);

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Time & Weather */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">World State</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-surface-2 border border-faint rounded p-2">
            <p className="text-muted mb-0.5">Time</p>
            <p className="text-gray-200 font-mono text-[11px]">{formatTime(world.time)}</p>
          </div>
          <div className="bg-surface-2 border border-faint rounded p-2">
            <p className="text-muted mb-0.5">Weather</p>
            <p className="text-gray-200 capitalize">{world.weather.current}</p>
            {world.weather.severity > 0 && (
              <p className="text-muted">Severity {world.weather.severity}</p>
            )}
          </div>
        </div>
      </section>

      {/* Current Location */}
      {currentRegion && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Current Location</p>
          <div className="border border-accent-gold/30 bg-accent-gold/5 rounded p-2.5">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-accent-gold">{currentRegion.name}</p>
              <Badge variant="red">Danger {currentRegion.dangerLevel}</Badge>
            </div>
            <p className="text-gray-500 leading-relaxed mb-2">{currentRegion.description}</p>
            {currentRegion.resources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentRegion.resources.map((r) => (
                  <Badge key={r} variant="muted">{r}</Badge>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Regions */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
          Regions ({world.regions.length})
        </p>
        <div className="flex flex-col gap-1.5">
          {world.regions.map((region) => (
            <div
              key={region.id}
              className={clsx(
                'border rounded p-2',
                region.id === location?.regionId
                  ? 'border-accent-gold/40 bg-accent-gold/5'
                  : 'border-faint bg-surface-2',
                !region.explored && 'opacity-60'
              )}
            >
              <div className="flex justify-between items-center">
                <span className={clsx('font-medium', region.explored ? 'text-gray-200' : 'text-muted')}>
                  {region.explored ? region.name : '??? Unknown Region'}
                </span>
                <div className="flex items-center gap-1.5">
                  {region.id === location?.regionId && (
                    <Badge variant="gold">HERE</Badge>
                  )}
                  <Badge variant={region.dangerLevel >= 7 ? 'red' : region.dangerLevel >= 4 ? 'orange' : 'muted'}>
                    ⚠ {region.dangerLevel}
                  </Badge>
                </div>
              </div>
              {region.explored && (
                <p className="text-muted mt-0.5 capitalize">{region.climate}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Discovered Secrets */}
      {world.secrets.filter((s) => s.discovered).length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Discovered Secrets ({world.secrets.filter((s) => s.discovered).length})
          </p>
          {world.secrets.filter((s) => s.discovered).map((secret) => (
            <div key={secret.id} className="border border-accent-purple/30 bg-accent-purple/5 rounded p-2 mb-1.5">
              <p className="text-gray-300 leading-relaxed">{secret.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
