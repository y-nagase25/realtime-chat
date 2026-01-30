import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const LINE_WIDTHS = ['100%', '95%', '88%', '100%', '92%', '78%', '100%', '85%'] as const;

export function PassageSkeleton() {
  return (
    <Card data-testid="passage-skeleton">
      <CardHeader className="space-y-3">
        <Skeleton data-testid="skeleton-title" className="h-7 w-3/4" />
        <div data-testid="skeleton-metadata" className="flex gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {LINE_WIDTHS.map((width, i) => (
          <Skeleton key={i} data-testid={`skeleton-line-${i}`} className="h-4" style={{ width }} />
        ))}
      </CardContent>
    </Card>
  );
}
