'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ReadingSession } from '@/lib/types/local-storage';
import { isoToDatetime } from '@/lib/utils/date-jst';
import { READING_LEVELS, READING_TOPICS } from '@/lib/constants/reading';
import { Trash } from 'lucide-react';
import { Button } from '../ui/button';

export function ReadingSessionHistory({
  readingSession,
  remove,
}: {
  readingSession: ReadingSession[];
  remove: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>レベル</TableHead>
          <TableHead>トピック</TableHead>
          <TableHead>タイトル</TableHead>
          <TableHead>スコア</TableHead>
          <TableHead>日時</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {readingSession.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{READING_LEVELS[session.level].labelJa}</TableCell>
            <TableCell>{READING_TOPICS.find((t) => t.id === session.topic)?.labelJa}</TableCell>
            <TableCell>{session.passageTitle}</TableCell>
            <TableCell>{session.scorePercentage}%</TableCell>
            <TableCell>{isoToDatetime(session.created_at)}</TableCell>
            <TableCell className="text-right">
              <Button onClick={() => remove(session.id)} variant="destructive">
                <Trash />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
