'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SavedVocabulary } from '@/lib/types/local-storage';
import { isoToDatetime } from '@/lib/utils/date-jst';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '../ui/button';
import { READING_LABELS } from '@/lib/constants/speaking-labels';
import { trimString } from '@/lib/utils/string';

export function VocabularyHistory({
  vocabularyHistory,
  remove,
}: {
  vocabularyHistory: SavedVocabulary[];
  remove: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>単語</TableHead>
          <TableHead>意味</TableHead>
          <TableHead>日時</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vocabularyHistory.map((vocabulary) => (
          <TableRow key={vocabulary.id}>
            <TableCell>{vocabulary.word}</TableCell>
            <TableCell>{trimString(vocabulary.definitionJa)}</TableCell>
            <TableCell>{isoToDatetime(vocabulary.created_at)}</TableCell>
            <TableCell className="text-right">
              <DetailSheet vocabulary={vocabulary} remove={remove} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DetailSheet({
  vocabulary,
  remove,
}: {
  vocabulary: SavedVocabulary;
  remove: (id: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">詳細</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>単語の詳細</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {READING_LABELS.word}
            </div>
            <div className="text-sm">{vocabulary.word}</div>
          </div>
          <div className="grid gap-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {READING_LABELS.pronunciation}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{vocabulary.pronunciation}</div>
          </div>
          <div className="grid gap-3">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {READING_LABELS.definitionJa}
            </div>
            <div className="text-sm">{vocabulary.definitionJa}</div>
          </div>
          <div className="grid gap-3">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {READING_LABELS.definitionEn}
            </div>
            <div className="text-sm">{vocabulary.definitionEn}</div>
          </div>
          <div className="grid gap-3">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {READING_LABELS.exampleSentence}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{vocabulary.exampleSentence}</div>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={() => remove(vocabulary.id)} variant="destructive">
            削除
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
