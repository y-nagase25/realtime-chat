'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  READING_HISTORY_STORAGE_KEY,
  SAVED_VOCABULARY_STORAGE_KEY,
  SPEAKING_ATTEMPTS_STORAGE_KEY,
  useLocalStorage,
} from '@/lib/hooks/use-local-storage';
import type { ReadingSession, SpeakingAttempt, SavedVocabulary } from '@/lib/types/local-storage';
import { HistoryItems } from './HistoryItems';

export function Histories() {
  const { history: readingHistory, remove: removeReadingHistory } = useLocalStorage<ReadingSession>(
    READING_HISTORY_STORAGE_KEY
  );

  const { history: speakingAttempts, remove: removeSpeakingAttempt } =
    useLocalStorage<SpeakingAttempt>(SPEAKING_ATTEMPTS_STORAGE_KEY);

  const { history: vocabularyHistory, remove: removeVocabularyHistory } =
    useLocalStorage<SavedVocabulary>(SAVED_VOCABULARY_STORAGE_KEY);

  return (
    <Tabs defaultValue="reading">
      <TabsList variant="line">
        <TabsTrigger value="reading">Reading({readingHistory.length})</TabsTrigger>
        <TabsTrigger value="speaking">Speaking({speakingAttempts.length})</TabsTrigger>
        <TabsTrigger value="vocabulary">Vocabulary({vocabularyHistory.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="reading">
        <HistoryItems history={readingHistory} remove={removeReadingHistory} variant="reading" />
      </TabsContent>
      <TabsContent value="speaking">
        <HistoryItems
          history={speakingAttempts}
          remove={removeSpeakingAttempt}
          variant="speaking"
        />
      </TabsContent>
      <TabsContent value="vocabulary">
        <HistoryItems
          history={vocabularyHistory}
          remove={removeVocabularyHistory}
          variant="vocabulary"
        />
      </TabsContent>
    </Tabs>
  );
}
