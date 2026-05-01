'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'gold' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-gray-300 border-faint',
  gold: 'bg-accent-gold/20 text-accent-gold border-accent-gold/40',
  red: 'bg-accent-red/20 text-accent-red border-accent-red/40',
  green: 'bg-accent-green/20 text-accent-green border-accent-green/40',
  blue: 'bg-accent-blue/20 text-accent-blue border-accent-blue/40',
  purple: 'bg-accent-purple/20 text-accent-purple border-accent-purple/40',
  orange: 'bg-accent-orange/20 text-accent-orange border-accent-orange/40',
  muted: 'bg-surface-2 text-muted border-faint',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
