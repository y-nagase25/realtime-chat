'use client';

import { useState } from 'react';
import type {
  ReadingLevel,
  ReadingTopicId,
  GrammarPatternId,
  ReadingSettingsValue,
  Passage,
} from '@/lib/types/reading';
import {
  READING_LEVELS,
  READING_LEVEL_OPTIONS,
  READING_TOPICS,
  GRAMMAR_PATTERNS,
} from '@/lib/constants/reading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from './ErrorMessage';
import { apiPost } from '@/lib/api-client';
import type { ApiResponse } from '@/lib/types/api';
import { RateLimitError } from '@/lib/errors';
import { useToast } from '@/lib/hooks/use-toast';
import { EXCEEDED_USAGE_LIMIT_MSG } from '@/lib/constants';
import { PassageSkeleton } from './PassageSkeleton';

export type ReadingSettingsProps = {
  handleStartReading: (passage: Passage) => void;
};

/**
 * ReadingSettings - Settings form for reading practice
 */
export function ReadingSettings({ handleStartReading }: ReadingSettingsProps) {
  const [readingSettings, setReadingSettings] = useState<ReadingSettingsValue>({
    level: 'A2',
    topic: 'daily-life',
    grammarFocus: undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast: showExceededUsageLimitToast } = useToast(EXCEEDED_USAGE_LIMIT_MSG, 'warning');

  const generatePassage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiPost<ApiResponse<Passage>>('/api/reading/generate', readingSettings);

      if (!data.success) {
        throw new Error(data.error || '文章の生成に失敗しました');
      }

      handleStartReading(data.data);
    } catch (err) {
      if (err instanceof RateLimitError) {
        showExceededUsageLimitToast();
        setError(EXCEEDED_USAGE_LIMIT_MSG);
      } else {
        setError('文章の生成に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4">
        <PassageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level Selector */}
      <div className="space-y-2">
        <Label htmlFor="level-selector">難易度</Label>
        <Select
          value={readingSettings.level}
          onValueChange={(value) =>
            setReadingSettings({ ...readingSettings, level: value as ReadingLevel })
          }
          disabled={isLoading}
        >
          <SelectTrigger id="level-selector" data-testid="level-selector" aria-label="難易度を選択">
            <SelectValue placeholder="難易度を選択">
              {READING_LEVELS[readingSettings.level].labelJa}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {READING_LEVEL_OPTIONS.map((levelOption) => {
              const levelConfig = READING_LEVELS[levelOption];
              return (
                <SelectItem key={levelOption} value={levelOption}>
                  <div className="flex flex-col">
                    <span>
                      {levelOption} -{' '}
                      {levelConfig.labelJa.replace(`${levelOption}（`, '').replace('）', '')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {levelConfig.descriptionJa}
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Topic Selector */}
      <div className="space-y-2">
        <Label htmlFor="topic-selector">トピック</Label>
        <Select
          value={readingSettings.topic}
          onValueChange={(value) =>
            setReadingSettings({ ...readingSettings, topic: value as ReadingTopicId })
          }
          disabled={isLoading}
        >
          <SelectTrigger
            id="topic-selector"
            data-testid="topic-selector"
            aria-label="トピックを選択"
          >
            <SelectValue placeholder="トピックを選択">
              {READING_TOPICS.find((t) => t.id === readingSettings.topic)?.labelJa}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {READING_TOPICS.map((topicOption) => (
              <SelectItem key={topicOption.id} value={topicOption.id}>
                <div className="flex flex-col">
                  <span>{topicOption.labelEn}</span>
                  <span className="text-xs text-muted-foreground">{topicOption.labelJa}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grammar Focus Selector (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="grammar-selector">文法フォーカス（オプション）</Label>
        <Select
          value={readingSettings.grammarFocus ?? 'none'}
          onValueChange={(value) =>
            setReadingSettings({
              ...readingSettings,
              grammarFocus: value === 'none' ? undefined : (value as GrammarPatternId),
            })
          }
          disabled={isLoading}
        >
          <SelectTrigger
            id="grammar-selector"
            data-testid="grammar-selector"
            aria-label="文法フォーカスを選択"
          >
            <SelectValue placeholder="選択なし">
              {readingSettings.grammarFocus
                ? GRAMMAR_PATTERNS.find((g) => g.id === readingSettings.grammarFocus)?.labelJa
                : '選択なし'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="text-muted-foreground">選択なし</span>
            </SelectItem>
            {GRAMMAR_PATTERNS.map((pattern) => (
              <SelectItem key={pattern.id} value={pattern.id}>
                <div className="flex flex-col">
                  <span>{pattern.labelEn}</span>
                  <span className="text-xs text-muted-foreground">{pattern.labelJa}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
      <Button
        onClick={() => generatePassage()}
        disabled={isLoading}
        data-testid="generate-button"
        data-loading={isLoading}
        aria-busy={isLoading}
        className="w-full min-h-11"
      >
        {isLoading ? '生成中...' : '文章を生成'}
      </Button>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} onRetry={() => generatePassage()} />
        </div>
      )}
    </div>
  );
}
