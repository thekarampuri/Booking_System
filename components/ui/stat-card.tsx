import { type ReactNode } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: 'maroon' | 'gold' | 'green';
  hint?: string;
}

export function StatCard({ label, value, icon, accent = 'maroon', hint }: StatCardProps) {
  const iconBg = {
    maroon: 'bg-maroon/10 text-maroon',
    gold: 'bg-gold-400/15 text-gold-600',
    green: 'bg-green-500/10 text-green-600',
  };
  return (
    <GlassCard className="p-5" hover>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-2xl font-bold text-maroon">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg[accent])}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}