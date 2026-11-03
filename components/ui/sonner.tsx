'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast glass-strong group-[.toaster]:text-foreground group-[.toaster]:shadow-glass',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-maroon group-[.toast]:text-cream-50',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
