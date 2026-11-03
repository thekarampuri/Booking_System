'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

export function BrandLogo({ size = 'sm', className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-maroon to-maroon-700 shadow-md shadow-maroon/30',
        sizes[size],
        className,
      )}
    >
      {!failed && (
        <img
          src="/logo.png"
          alt="Mahalaxmi Beauty Salon & Academy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && <Sparkles className="h-1/2 w-1/2 text-gold-200" />}
    </div>
  );
}
