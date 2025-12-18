'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { QuestionBadge } from '@/components/QuestionBadge';
import { Search } from 'lucide-react';
import type { Question } from '@/lib/types/db';
import { applyFilters } from '@/lib/utils/question-filters';

interface QuestionsListProps {
  questions: Question[];
  onQuestionSelect: (question: Question, index: number) => void;
  selectedQuestionId?: number;
}

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All', level: null },
  { value: 'beginner', label: '初級', level: 1 },
  { value: 'intermediate', label: '中級', level: 2 },
  { value: 'advanced', label: '上級', level: 3 },
] as const;

export function QuestionsList({
  questions,
  onQuestionSelect,
  selectedQuestionId,
}: QuestionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return applyFilters(questions, debouncedSearch, selectedLevel);
  }, [questions, debouncedSearch, selectedLevel]);

  const handleQuestionClick = useCallback(
    (question: Question) => {
      const originalIndex = questions.findIndex((q) => q.id === question.id);
      onQuestionSelect(question, originalIndex);
    },
    [questions, onQuestionSelect]
  );

  const handleDifficultyChange = (value: string) => {
    const option = DIFFICULTY_OPTIONS.find((opt) => opt.value === value);
    setSelectedLevel(option?.level ?? null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLevel(null);
  };

  const hasFilters = searchTerm || selectedLevel !== null;

  // Empty state - no questions in database
  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>No questions available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
        <CardDescription>Select a question to practice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            aria-label="Search questions"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <Label>Difficulty Level</Label>
          <RadioGroup
            value={
              selectedLevel === null
                ? 'all'
                : DIFFICULTY_OPTIONS.find((opt) => opt.level === selectedLevel)?.value || 'all'
            }
            onValueChange={handleDifficultyChange}
            className="flex flex-wrap gap-4"
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>
          {hasFilters && (
            <Button variant="link" size="sm" onClick={handleClearFilters} className="h-auto p-0">
              Clear filters
            </Button>
          )}
        </div>

        {/* No Results State */}
        {filteredQuestions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No questions found matching your criteria.</p>
            <Button variant="link" onClick={handleClearFilters} className="mt-2">
              Clear filters
            </Button>
          </div>
        ) : (
          /* Questions Table */
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-right">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-24">Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question, _index) => {
                  const originalIndex = questions.findIndex((q) => q.id === question.id);
                  const isSelected = question.id === selectedQuestionId;

                  return (
                    <TableRow
                      key={question.id}
                      onClick={() => handleQuestionClick(question)}
                      className={`cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleQuestionClick(question);
                        }
                      }}
                    >
                      <TableCell className="text-right font-medium">{originalIndex + 1}</TableCell>
                      <TableCell className="max-w-md truncate" title={question.question}>
                        {question.question}
                      </TableCell>
                      <TableCell>
                        <QuestionBadge level={question.level} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
