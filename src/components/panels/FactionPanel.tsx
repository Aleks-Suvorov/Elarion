'use client';

import { useGameStore } from '../../state/gameStore';
import { Badge } from '../ui/Badge';

function attitudeLabel(a: number): { label: string; variant: 'green' | 'gold' | 'red' | 'muted' } {
  if (a >= 50) return { label: 'Allied', variant: 'green' };
  if (a >= 10) return { label: 'Friendly', variant: 'gold' };
  if (a >= -10) return { label: 'Neutral', variant: 'muted' };
  if (a >= -40) return { label: 'Unfriendly', variant: 'red' };
  return { label: 'Hostile', variant: 'red' };
}

function powerBar(power: number): string {
  return '█'.repeat(power) + '░'.repeat(10 - power);
}

export function FactionPanel() {
  const world = useGameStore((s) => s.world);

  if (!world) return <p className="text-xs text-muted italic text-center py-8">No world loaded.</p>;

  return (
    <div className="flex flex-col gap-3 text-xs">
      {world.factions.map((faction) => {
        const att = attitudeLabel(faction.attitude);
        const territories = world.regions.filter((r) => faction.territory.includes(r.id));
        const members = world.npcs.filter((n) => faction.memberIds.includes(n.id));

        return (
          <div key={faction.id} className="border border-faint rounded p-3 bg-surface-2">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-gray-100">{faction.name}</p>
              <Badge variant={att.variant}>{att.label}</Badge>
            </div>

            <p className="text-gray-500 leading-relaxed mb-2">{faction.description}</p>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted">Power:</span>
              <span className="font-mono text-[10px] text-accent-gold tracking-tight">
                {powerBar(faction.power)}
              </span>
              <span className="text-gray-400">{faction.power}/10</span>
            </div>

            {territories.length > 0 && (
              <div className="mb-2">
                <span className="text-muted">Territory: </span>
                {territories.map((r) => (
                  <Badge key={r.id} variant="default" className="mr-1">{r.name}</Badge>
                ))}
              </div>
            )}

            {faction.goals.length > 0 && (
              <div className="mb-2">
                <p className="text-muted mb-0.5">Goals:</p>
                {faction.goals.slice(0, 2).map((g, i) => (
                  <p key={i} className="text-gray-500 leading-relaxed">◦ {g}</p>
                ))}
              </div>
            )}

            {members.length > 0 && (
              <div>
                <span className="text-muted">Known members: </span>
                {members.slice(0, 3).map((n) => (
                  <span key={n.id} className="text-gray-400 after:content-[',_'] last:after:content-['']">{n.name}</span>
                ))}
                {members.length > 3 && <span className="text-muted"> +{members.length - 3}</span>}
              </div>
            )}
          </div>
        );
      })}
      {world.factions.length === 0 && (
        <p className="text-muted italic text-center py-8">No factions.</p>
      )}
    </div>
  );
}
