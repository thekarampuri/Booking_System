import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'maroon' | 'gold';
  hover?: boolean;
}

export function GlassCard({
  className,
  variant = 'default',
  hover = false,
  children,
  ...props
}: GlassCardProps) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong',
    maroon: 'glass-maroon text-cream-50',
    gold: 'glass-gold',
  };
  return (
    <div
      className={cn(
        variants[variant],
        'rounded-2xl',
        hover && 'transition-all duration-300 hover:shadow-glass hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}