'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SpeakingAttempt } from '@/lib/types/local-storage';
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
import { getScoreBadgeClass } from '@/lib/utils/scoring';
import { SPEAKING_LABELS } from '@/lib/constants/speaking-labels';

export function SpeakingAttemptHistory({
  speakingAttempts,
  remove,
}: {
  speakingAttempts: SpeakingAttempt[];
  remove: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>会話フレーズ</TableHead>
          <TableHead>あなたの回答</TableHead>
          <TableHead>スコア</TableHead>
          <TableHead>日時</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {speakingAttempts.map((session) => (
          <TableRow key={session.id}>
            <TableCell>{session.questionText}</TableCell>
            <TableCell>{session.transcript}</TableCell>
            <TableCell>{session.score}</TableCell>
            <TableCell>{isoToDatetime(session.created_at)}</TableCell>
            <TableCell className="text-right">
              <DetailSheet session={session} remove={remove} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DetailSheet({
  session,
  remove,
}: {
  session: SpeakingAttempt;
  remove: (id: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">詳細</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>採点結果の詳細</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3 justify-center">
            <div
              className={`text-[1.5rem] flex h-16 w-16 items-center justify-center rounded-full border-2 font-bold ${getScoreBadgeClass(session.score)}`}
            >
              {session.score}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              会話フレーズ
            </div>
            <div className="text-sm">{session.questionText}</div>
          </div>
          <div className="grid gap-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {SPEAKING_LABELS.result}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{session.transcript}</div>
          </div>
          <div className="grid gap-3">
            <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {SPEAKING_LABELS.answer}
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">{session.modelAnswer}</div>
          </div>
          <div className="grid gap-3">
            {session.good_points.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {SPEAKING_LABELS.goodPoints}
                </div>
                <ul className="space-y-1">
                  {session.good_points.map((point, index) => (
                    <li key={index} className="text-sm">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {session.areas_for_improvement.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {SPEAKING_LABELS.areasForImprovement}
                </div>
                <ul className="space-y-1">
                  {session.areas_for_improvement.map((area, index) => (
                    <li key={index} className="text-sm">
                      • {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid gap-3"></div>
        </div>
        <SheetFooter>
          <Button onClick={() => remove(session.id)} variant="destructive">
            削除
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
