'use client';

import { useGameStore } from '../../state/gameStore';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

export function InventoryPanel() {
  const character = useGameStore((s) => s.character);

  if (!character) {
    return <p className="text-xs text-muted italic text-center py-8">No character loaded.</p>;
  }

  const { inventory, equipment } = character;
  const totalWeight = inventory.reduce((sum, i) => sum + i.weight * i.quantity, 0);

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Equipment slots */}
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Equipped</p>
        <div className="flex flex-col gap-1.5">
          {(['weapon', 'armor', 'offhand', 'accessory1', 'accessory2'] as const).map((slot) => {
            const item = equipment[slot];
            return (
              <div
                key={slot}
                className="flex justify-between items-center bg-surface-2 border border-faint rounded p-2"
              >
                <span className="text-muted capitalize">{slot.replace(/\d/, ' #$&')}</span>
                {item ? (
                  <span className="text-accent-gold font-medium truncate ml-2">{item.name}</span>
                ) : (
                  <span className="text-faint italic">empty</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Inventory list */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] text-muted uppercase tracking-wider">Inventory</p>
          <span className="text-muted">{totalWeight.toFixed(1)} lbs</span>
        </div>
        {inventory.length === 0 ? (
          <p className="text-muted italic text-center py-4">Empty.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={clsx(
                  'bg-surface-2 border border-faint rounded p-2',
                  item.equipped && 'border-accent-gold/30'
                )}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-gray-200 font-medium">{item.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.modifier !== undefined && item.modifier !== 0 && (
                      <Badge variant={item.modifier > 0 ? 'green' : 'red'}>
                        {item.modifier > 0 ? `+${item.modifier}` : item.modifier}
                      </Badge>
                    )}
                    <Badge variant="muted">×{item.quantity}</Badge>
                  </div>
                </div>
                <div className="flex gap-3 text-muted">
                  <span>{item.weight}lb</span>
                  <span>{item.value}¤</span>
                  {item.tags.map((t) => (
                    <span key={t} className="text-faint">[{t}]</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Resources */}
      <ResourcesSection />
    </div>
  );
}

function ResourcesSection() {
  const resources = useGameStore((s) => s.resources);
  const entries = Object.entries(resources);
  if (entries.length === 0) return null;

  return (
    <section>
      <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Resources</p>
      <div className="grid grid-cols-2 gap-1.5">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className="flex justify-between bg-surface-2 border border-faint rounded px-2 py-1.5"
          >
            <span className="text-gray-400 capitalize">{key}</span>
            <span className="text-gray-200 tabular-nums font-mono">{val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
