'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon dark:bg-gold-500/10 dark:text-gold-400',
          className
        )}
        aria-hidden="true"
      >
        <span className="h-5 w-5" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/5 text-maroon transition-colors hover:bg-maroon/10 dark:bg-gold-500/10 dark:text-gold-400 dark:hover:bg-gold-500/20',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-5 w-5 transition-transform rotate-0 scale-100" />
      )}
    </button>
  );
}
