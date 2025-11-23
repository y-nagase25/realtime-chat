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
    case 'beginner':
      return {
        label: 'Beginner',
        variant: 'outline',
        className: 'border-green-500 text-green-700 dark:text-green-400',
      };
    case 'intermediate':
      return {
        label: 'Intermediate',
        variant: 'outline',
        className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
      };
    case 'advanced':
      return {
        label: 'Advanced',
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
