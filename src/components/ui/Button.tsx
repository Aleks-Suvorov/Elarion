'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-accent-gold text-surface-0 border border-accent-gold font-semibold',
    'shimmer',
    'hover:shadow-[0_0_24px_rgba(201,168,76,0.45),0_0_48px_rgba(201,168,76,0.15)]',
    'hover:scale-[1.02] active:scale-[0.98]',
    'transition-all duration-200',
  ].join(' '),

  secondary: [
    'bg-surface-3 text-gray-200 border border-faint',
    'shimmer',
    'hover:bg-surface-4 hover:border-gray-500/60',
    'hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]',
    'hover:scale-[1.01] active:scale-[0.99]',
    'transition-all duration-200',
  ].join(' '),

  ghost: [
    'bg-transparent text-gray-300 border border-transparent',
    'hover:bg-surface-2 hover:text-gray-100 hover:border-faint',
    'transition-all duration-150',
  ].join(' '),

  danger: [
    'bg-accent-red text-white border border-accent-red font-semibold',
    'shimmer',
    'hover:shadow-[0_0_20px_rgba(201,76,76,0.45)]',
    'hover:scale-[1.02] active:scale-[0.98]',
    'transition-all duration-200',
  ].join(' '),

  outline: [
    'bg-transparent text-accent-gold border border-accent-gold/50',
    'shimmer',
    'hover:border-accent-gold hover:bg-accent-gold/8',
    'hover:shadow-[0_0_16px_rgba(201,168,76,0.25)]',
    'hover:scale-[1.01] active:scale-[0.99]',
    'transition-all duration-200',
  ].join(' '),
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-2.5 py-1.5 rounded',
  md: 'text-sm px-3.5 py-2 rounded-md',
  lg: 'text-base px-5 py-2.5 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading = false, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold/50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
