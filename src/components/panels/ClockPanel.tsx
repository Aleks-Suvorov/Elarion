'use client';

import { useGameStore } from '../../state/gameStore';
import { ClockDisplay } from '../ui/ClockDisplay';
import { urgentClocks } from '../../engine/worldSim';

export function ClockPanel() {
  const world = useGameStore((s) => s.world);

  if (!world) return <p className="text-xs text-muted italic text-center py-8">No world loaded.</p>;

  const active = urgentClocks(world.clocks);
  const completed = world.clocks.filter((c) => c.ticks >= c.maxTicks);

  return (
    <div className="flex flex-col gap-3 text-xs">
      {active.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Active Clocks ({active.length})
          </p>
          <div className="flex flex-col gap-2">
            {active.map((clock) => (
              <ClockDisplay key={clock.id} clock={clock} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Completed ({completed.length})
          </p>
          <div className="flex flex-col gap-2">
            {completed.map((clock) => (
              <ClockDisplay key={clock.id} clock={clock} compact />
            ))}
          </div>
        </section>
      )}

      {world.clocks.length === 0 && (
        <p className="text-muted italic text-center py-8">No clocks active.</p>
      )}
    </div>
  );
}
