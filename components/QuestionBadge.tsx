import { Badge } from '@/components/ui/badge';
import type { Question } from '@/lib/types/db';

interface QuestionBadgeProps {
  level?: Question['level'];
}

type LevelBadgeConfig = {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
};

function getLevelBadgeConfig(level?: Question['level']): LevelBadgeConfig | null {
  if (!level) return null;

  switch (level) {
    case 1:
      return {
        label: '初級',
        variant: 'outline',
        className: 'border-green-500 text-green-700 dark:text-green-400',
      };
    case 2:
      return {
        label: '中級',
        variant: 'outline',
        className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
      };
    case 3:
      return {
        label: '上級',
        variant: 'outline',
        className: 'border-red-500 text-red-700 dark:text-red-400',
      };
    default:
      return null;
  }
}

export function QuestionBadge({ level }: QuestionBadgeProps) {
  const badgeConfig = getLevelBadgeConfig(level);

  if (!badgeConfig) return null;

  return (
    <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
      {badgeConfig.label}
    </Badge>
  );
}
