import { GlassCard } from '@/components/ui/glass-card';

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-maroon/5 ${className ?? ''}`} />;
}

export function StatCardSkeleton() {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
    </GlassCard>
  );
}

export function BookingCardSkeleton() {
  return (
    <GlassCard className="p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
    </GlassCard>
  );
}

export function CalendarSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </GlassCard>
  );
}
