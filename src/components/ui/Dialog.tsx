'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-2xl',
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-[95vw] max-h-[85vh] overflow-auto',
            maxWidth,
            'bg-surface-1 border border-faint rounded-lg shadow-2xl',
            'data-[state=open]:animate-slide-in',
            'focus:outline-none',
            className
          )}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-faint">
            <div>
              <RadixDialog.Title className="text-sm font-semibold text-gray-100 uppercase tracking-wider">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-xs text-muted mt-0.5">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <Button variant="ghost" size="sm" className="ml-4 shrink-0">
                ✕
              </Button>
            </RadixDialog.Close>
          </div>
          <div className="px-5 py-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
