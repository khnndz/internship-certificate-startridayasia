interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'button';
  count?: number;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'text',
  count = 1 
}: LoadingSkeletonProps) {
  const skeletonItems = Array.from({ length: count }, (_, i) => i);

  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const variantClasses = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    table: 'h-12 w-full',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
  };

  return (
    <>
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className={`${baseClass} ${variantClasses[variant]} ${className}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </>
  );
}

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-1/3" />
            <LoadingSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardLoadingSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }, (_, i) => (
        <div key={i} className="p-6 border border-gray-200 rounded-lg space-y-3">
          <LoadingSkeleton variant="text" className="w-2/3" />
          <LoadingSkeleton variant="text" className="w-full" />
          <LoadingSkeleton variant="text" className="w-4/5" />
          <LoadingSkeleton variant="button" className="mt-4" />
        </div>
      ))}
    </div>
  );
}

export function FormLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="space-y-2">
          <LoadingSkeleton variant="text" className="w-24 h-4" />
          <LoadingSkeleton variant="text" className="w-full h-10" />
        </div>
      ))}
      <LoadingSkeleton variant="button" className="mt-6" />
    </div>
  );
}
