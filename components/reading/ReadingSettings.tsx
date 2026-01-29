/**
 * ReadingSettings Component
 * Allows users to configure reading practice settings:
 * - Difficulty level (A1-C1)
 * - Topic selection
 * - Optional grammar focus
 */

'use client';

import { useState } from 'react';
import type { ReadingLevel, ReadingTopicId, GrammarPatternId } from '@/lib/types/reading';
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

/**
 * Settings selected by the user
 */
export type ReadingSettingsValue = {
  level: ReadingLevel;
  topic: ReadingTopicId;
  grammarFocus?: GrammarPatternId;
};

/**
 * Props for ReadingSettings component
 */
export type ReadingSettingsProps = {
  /** Callback when user submits settings */
  onSubmit: (settings: ReadingSettingsValue) => void;
  /** Whether the form is currently submitting (shows loading state) */
  isLoading?: boolean;
  /** Default values for the settings */
  defaultValue?: Partial<ReadingSettingsValue>;
};

const DEFAULT_LEVEL: ReadingLevel = 'A2';
const DEFAULT_TOPIC: ReadingTopicId = 'daily-life';

/**
 * ReadingSettings - Settings form for reading practice
 */
export function ReadingSettings({
  onSubmit,
  isLoading = false,
  defaultValue,
}: ReadingSettingsProps) {
  const [level, setLevel] = useState<ReadingLevel>(defaultValue?.level ?? DEFAULT_LEVEL);
  const [topic, setTopic] = useState<ReadingTopicId>(defaultValue?.topic ?? DEFAULT_TOPIC);
  const [grammarFocus, setGrammarFocus] = useState<GrammarPatternId | undefined>(
    defaultValue?.grammarFocus
  );

  const handleSubmit = () => {
    onSubmit({
      level,
      topic,
      grammarFocus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Level Selector */}
      <div className="space-y-2">
        <Label htmlFor="level-selector">難易度</Label>
        <Select
          value={level}
          onValueChange={(value) => setLevel(value as ReadingLevel)}
          disabled={isLoading}
        >
          <SelectTrigger id="level-selector" data-testid="level-selector" aria-label="難易度を選択">
            <SelectValue placeholder="難易度を選択">{READING_LEVELS[level].labelJa}</SelectValue>
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
          value={topic}
          onValueChange={(value) => setTopic(value as ReadingTopicId)}
          disabled={isLoading}
        >
          <SelectTrigger
            id="topic-selector"
            data-testid="topic-selector"
            aria-label="トピックを選択"
          >
            <SelectValue placeholder="トピックを選択">
              {READING_TOPICS.find((t) => t.id === topic)?.labelJa}
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
          value={grammarFocus ?? 'none'}
          onValueChange={(value) =>
            setGrammarFocus(value === 'none' ? undefined : (value as GrammarPatternId))
          }
          disabled={isLoading}
        >
          <SelectTrigger
            id="grammar-selector"
            data-testid="grammar-selector"
            aria-label="文法フォーカスを選択"
          >
            <SelectValue placeholder="選択なし">
              {grammarFocus
                ? GRAMMAR_PATTERNS.find((g) => g.id === grammarFocus)?.labelJa
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
        onClick={handleSubmit}
        disabled={isLoading}
        data-testid="generate-button"
        data-loading={isLoading}
        aria-busy={isLoading}
        className="w-full min-h-11"
      >
        {isLoading ? '生成中...' : '文章を生成'}
      </Button>
    </div>
  );
}
