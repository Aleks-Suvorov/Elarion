'use client';

import { useGameStore } from '../../state/gameStore';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

export function QuestPanel() {
  const world = useGameStore((s) => s.world);

  if (!world) return <p className="text-xs text-muted italic text-center py-8">No world loaded.</p>;

  const { active, completed, failed } = world.quests;

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Active */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-[10px] text-muted uppercase tracking-wider">Active</p>
          <Badge variant="gold">{active.length}</Badge>
        </div>
        {active.length === 0 ? (
          <p className="text-muted italic">No active quests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((q) => (
              <div key={q.id} className="border border-faint rounded p-2.5 bg-surface-2">
                <p className="font-semibold text-gray-200 mb-1">{q.title}</p>
                <p className="text-gray-500 leading-relaxed mb-2">{q.description}</p>
                <div className="flex flex-col gap-1">
                  {q.objectives.map((obj) => (
                    <div key={obj.id} className="flex items-start gap-1.5">
                      <span className={clsx('mt-0.5', obj.completed ? 'text-accent-green' : 'text-muted')}>
                        {obj.completed ? '✓' : '◌'}
                      </span>
                      <span className={clsx(obj.completed ? 'text-gray-500 line-through' : 'text-gray-300')}>
                        {obj.description}
                        {obj.optional && <span className="text-muted ml-1">(optional)</span>}
                      </span>
                    </div>
                  ))}
                </div>
                {q.rewards.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {q.rewards.map((r) => (
                      <Badge key={r} variant="muted">{r}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Completed ({completed.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {completed.map((q) => (
              <div key={q.id} className="flex items-center gap-2 text-gray-500">
                <span className="text-accent-green">✓</span>
                <span className="line-through">{q.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <section>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2">
            Failed ({failed.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {failed.map((q) => (
              <div key={q.id} className="flex items-center gap-2 text-gray-500">
                <span className="text-accent-red">✗</span>
                <span>{q.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
