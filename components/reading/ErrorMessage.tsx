import { Button } from '@/components/ui/button';

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div data-testid="error-message" className="flex items-center gap-3 text-sm text-destructive">
      <span>{message}</span>
      {onRetry && (
        <Button data-testid="error-retry-button" variant="outline" size="sm" onClick={onRetry}>
          再試行
        </Button>
      )}
    </div>
  );
}
