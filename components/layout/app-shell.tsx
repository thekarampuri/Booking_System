'use client';

import { type ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { ReminderBanner } from '@/components/reminders/reminder-banner';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="print:hidden">
        <ReminderBanner />
      </div>
      {(title || actions) && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 print:hidden">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title && (
                <h1 className="font-serif text-2xl font-bold text-maroon sm:text-3xl animate-fade-in">{title}</h1>
              )}
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 print:m-0 print:max-w-none print:p-0">{children}</main>
    </div>
  );
}