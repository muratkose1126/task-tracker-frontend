'use client';

import { cn } from '@/lib/utils';

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function ResponsiveGrid({
  columns = { default: 1, md: 2, lg: 3 },
  gap = 'md',
  className,
  ...props
}: ResponsiveGridProps) {
  const gridClass = cn(
    'grid',
    {
      'grid-cols-1': columns.default === 1,
      'grid-cols-2': columns.default === 2,
      'grid-cols-3': columns.default === 3,
      'grid-cols-4': columns.default === 4,
      'sm:grid-cols-1': columns.sm === 1,
      'sm:grid-cols-2': columns.sm === 2,
      'sm:grid-cols-3': columns.sm === 3,
      'sm:grid-cols-4': columns.sm === 4,
      'md:grid-cols-1': columns.md === 1,
      'md:grid-cols-2': columns.md === 2,
      'md:grid-cols-3': columns.md === 3,
      'md:grid-cols-4': columns.md === 4,
      'lg:grid-cols-1': columns.lg === 1,
      'lg:grid-cols-2': columns.lg === 2,
      'lg:grid-cols-3': columns.lg === 3,
      'lg:grid-cols-4': columns.lg === 4,
      'xl:grid-cols-1': columns.xl === 1,
      'xl:grid-cols-2': columns.xl === 2,
      'xl:grid-cols-3': columns.xl === 3,
      'xl:grid-cols-4': columns.xl === 4,
    },
    gapClasses[gap],
    className
  );

  return <div className={gridClass} {...props} />;
}
