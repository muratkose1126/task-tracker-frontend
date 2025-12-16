'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pageTransitionVariants = cva('transition-all duration-300 ease-out', {
  variants: {
    animation: {
      slideIn: 'animate-in slide-in-from-right-10',
      fadeIn: 'animate-in fade-in',
      scaleIn: 'animate-in zoom-in-90',
    },
  },
  defaultVariants: {
    animation: 'fadeIn',
  },
});

interface AnimatedPageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageTransitionVariants> {}

export function AnimatedPage({
  animation,
  className,
  ...props
}: AnimatedPageProps) {
  return (
    <div className={cn(pageTransitionVariants({ animation }), className)} {...props} />
  );
}

// Stagger animations for lists
const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export { staggerContainerVariants, staggerItemVariants };

// Skeleton loading animation
export function SkeletonLoading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
