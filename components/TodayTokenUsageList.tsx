'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import type { TokenUsageRow } from '@/lib/types/db';
import { Skeleton } from './ui/skeleton';

/**
 * Formats ISO timestamp to JST time-only display (HH:MM:SS)
 */
function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString('en-US', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

interface TodayTokenUsageListProps {
  records: TokenUsageRow[];
  totalRecordCount: number;
  isLoading: boolean;
  hasError: boolean;
}

export function TodayTokenUsageList({
  records,
  totalRecordCount,
  isLoading,
  hasError,
}: TodayTokenUsageListProps) {
  if (isLoading) {
    return <LoadingTodayTokenUsageList />;
  }
  if (hasError) {
    return <ErrorTodayTokenUsageList />;
  }
  if (records.length === 0) {
    return <EmptyTodayTokenUsageList />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Records</CardTitle>
        <CardDescription>
          {totalRecordCount} {totalRecordCount === 1 ? 'record' : 'records'} today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>API Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Duration(sec)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="tabular-nums">{formatTime(record.created_at)}</TableCell>
                <TableCell>{record.api_type}</TableCell>
                <TableCell>{record.model_name}</TableCell>
                <TableCell>
                  {record.total_tokens !== null ? `${record.total_tokens}` : '-'}
                </TableCell>
                <TableCell>
                  {record.audio_duration_seconds !== null
                    ? `${record.audio_duration_seconds}s`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LoadingTodayTokenUsageList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Records</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>API Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Duration(sec)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-12" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ErrorTodayTokenUsageList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Records</CardTitle>
        <CardDescription>Error loading records</CardDescription>
      </CardHeader>
    </Card>
  );
}

function EmptyTodayTokenUsageList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Records</CardTitle>
        <CardDescription>No records today</CardDescription>
      </CardHeader>
    </Card>
  );
}
