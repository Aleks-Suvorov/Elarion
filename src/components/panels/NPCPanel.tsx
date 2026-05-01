'use client';

import { useGameStore } from '../../state/gameStore';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

function dispositionLabel(d: number): { label: string; variant: 'green' | 'gold' | 'red' | 'muted' } {
  if (d >= 60) return { label: 'Friendly', variant: 'green' };
  if (d >= 20) return { label: 'Neutral', variant: 'gold' };
  if (d >= -20) return { label: 'Wary', variant: 'muted' };
  return { label: 'Hostile', variant: 'red' };
}

export function NPCPanel() {
  const world = useGameStore((s) => s.world);

  if (!world) return <p className="text-xs text-muted italic text-center py-8">No world loaded.</p>;

  const major = world.npcs.filter((n) => !n.isMinor && n.alive);
  const minor = world.npcs.filter((n) => n.isMinor && n.alive);
  const dead = world.npcs.filter((n) => !n.alive);

  return (
    <div className="flex flex-col gap-4 text-xs">
      <section>
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
          Major NPCs ({major.length})
        </p>
        <div className="flex flex-col gap-2">
          {major.map((npc) => {
            const disp = dispositionLabel(npc.disposition);
            const faction = world.factions.find((f) => f.id === npc.factionId);
            return (
              <div key={npc.id} className="border border-faint rounded p-2.5 bg-surface-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-gray-200">{npc.name}</p>
                  <Badge variant={disp.variant}>{disp.label}</Badge>
                </div>
                <p className="text-muted capitalize mb-0.5">{npc.role} · {npc.species}</p>
                {faction && <p className="text-gray-500">{faction.name}</p>}
                {npc.notes && <p className="text-gray-500 mt-1 leading-relaxed">{npc.notes}</p>}
                {npc.backstory && <p className="text-gray-600 mt-0.5 italic">{npc.backstory}</p>}
              </div>
            );
          })}
          {major.length === 0 && <p className="text-muted italic">None tracked yet.</p>}
        </div>
      </section>

      {minor.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Known ({minor.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {minor.map((npc) => {
              const disp = dispositionLabel(npc.disposition);
              return (
                <div key={npc.id} className="flex justify-between items-center py-1 border-b border-faint last:border-0">
                  <div>
                    <span className="text-gray-300">{npc.name}</span>
                    <span className="text-muted ml-1 capitalize">· {npc.role}</span>
                  </div>
                  <Badge variant={disp.variant} className="shrink-0">{disp.label}</Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {dead.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Deceased</p>
          <div className="flex flex-col gap-1">
            {dead.map((npc) => (
              <span key={npc.id} className="text-gray-600 line-through">{npc.name}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
