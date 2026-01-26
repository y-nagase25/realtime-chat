'use client';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { READING_HISTORY_STORAGE_KEY, useLocalStorage } from '@/lib/hooks/use-local-storage';
import type { ReadingSession } from '@/lib/types/reading';
import { TrashIcon } from 'lucide-react';
import { AttemptHistory } from './AtemptHistory';

export function Histories() {
  const {
    history: readingHistory,
    add: addReadingHistory,
    remove: removeReadingHistory,
  } = useLocalStorage<ReadingSession>(READING_HISTORY_STORAGE_KEY);

  const handleAddReadingHistory = () => {
    const data: Omit<ReadingSession, 'id' | 'timestamp'> = {
      level: 'A1',
      topic: 'daily-life',
      passageTitle: 'Passage Title',
      wordCount: 100,
      readingTimeSeconds: 100,
      wordsPerMinute: 100,
      questionsTotal: 100,
      questionsCorrect: 100,
      scorePercentage: 100,
      savedWords: ['word1', 'word2', 'word3'],
    };
    addReadingHistory(data);
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/2 p-4">
        <h2>
          {'Reading Practice'} ({readingHistory.length})
        </h2>
        <div className="mt-4 space-y-4">
          {readingHistory.map((hist) => (
            <Item key={hist.id} variant="outline">
              <ItemContent>
                <ItemTitle>{hist.id}</ItemTitle>
                <ItemDescription>time: {hist.timestamp}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeReadingHistory(hist.id)}
                >
                  <TrashIcon size={16} />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
        <Button onClick={handleAddReadingHistory}>Add</Button>
      </div>
      <div className="w-1/2 p-4">
        <AttemptHistory />
      </div>
    </div>
  );
}
