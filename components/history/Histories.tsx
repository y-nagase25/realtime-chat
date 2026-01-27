'use client';

import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  READING_HISTORY_STORAGE_KEY,
  SPEAKING_ATTEMPTS_STORAGE_KEY,
  useLocalStorage,
} from '@/lib/hooks/use-local-storage';
import type { ReadingSession } from '@/lib/types/reading';
import type { SpeakingAttempt } from '@/lib/types/speaking';
import { TrashIcon } from 'lucide-react';
import { AttemptHistory } from './AtemptHistory';

export function Histories() {
  const {
    history: readingHistory,
    add: addReadingHistory,
    remove: removeReadingHistory,
  } = useLocalStorage<ReadingSession>(READING_HISTORY_STORAGE_KEY);

  const { history: speakingAttempts, remove: removeSpeakingAttempt } =
    useLocalStorage<SpeakingAttempt>(SPEAKING_ATTEMPTS_STORAGE_KEY);

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
    <Tabs defaultValue="reading">
      <TabsList variant="line">
        <TabsTrigger value="reading">Reading({readingHistory.length})</TabsTrigger>
        <TabsTrigger value="speaking">Speaking({speakingAttempts.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="reading">
        <Button onClick={handleAddReadingHistory}>Add</Button>
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
      </TabsContent>
      <TabsContent value="speaking">
        <AttemptHistory history={speakingAttempts} remove={removeSpeakingAttempt} />
      </TabsContent>
    </Tabs>
  );
}
