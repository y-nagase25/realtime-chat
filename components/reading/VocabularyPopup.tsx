/**
 * VocabularyPopup Component
 * Displays word definition, pronunciation, part of speech,
 * and save functionality in a floating popup.
 */

'use client';

import { useEffect, useRef } from 'react';
import type { VocabularyEntry } from '@/lib/types/reading';
import { ErrorMessage } from '@/components/reading/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

/**
 * Props for the VocabularyPopup component
 */
export type VocabularyPopupProps = {
  /** The word being looked up */
  word: string;
  /** The vocabulary entry data (null while loading) */
  entry: VocabularyEntry | null;
  /** Whether the vocabulary lookup is in progress */
  isLoading: boolean;
  /** Position to display the popup near */
  position: { x: number; y: number };
  /** Callback when the popup is closed */
  onClose: () => void;
  /** Callback when the user saves the word */
  onSave: () => void;
  /** Whether the word has been saved */
  isSaved?: boolean;
  /** Error message to display */
  error?: string;
  /** Callback when user clicks retry after an error */
  onRetry?: () => void;
};

/**
 * VocabularyPopup - Floating popup showing word definition and details
 */
export function VocabularyPopup({
  word,
  entry,
  isLoading,
  position,
  onClose,
  onSave,
  isSaved = false,
  error,
  onRetry,
}: VocabularyPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const popupStyle = computePopupPosition(position);

  return (
    <div
      ref={popupRef}
      data-testid="vocabulary-popup"
      className="fixed z-50 w-72 sm:w-80 animate-in fade-in-0 zoom-in-95"
      style={popupStyle}
    >
      <Card className="shadow-lg border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <span data-testid="vocab-word" className="text-lg font-bold">
              {word}
            </span>
            <button
              type="button"
              data-testid="vocab-close-button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none min-w-11 min-h-11 flex items-center justify-center"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
          {!isLoading && entry && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {entry.pronunciation && (
                <span data-testid="vocab-pronunciation">{entry.pronunciation}</span>
              )}
              <span data-testid="vocab-part-of-speech">{entry.partOfSpeech}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0">
          {error && (
            <div data-testid="vocab-error" className="py-4">
              <ErrorMessage message={error} onRetry={onRetry} />
            </div>
          )}

          {!error && isLoading && (
            <div data-testid="vocab-loading" className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">読み込み中...</span>
            </div>
          )}

          {!error && !isLoading && entry && (
            <div className="space-y-3">
              <div className="space-y-1">
                <p data-testid="vocab-definition-en" className="text-sm">
                  <span className="text-muted-foreground">EN:</span> {entry.definitionEn}
                </p>
                <p data-testid="vocab-definition-ja" className="text-sm">
                  <span className="text-muted-foreground">JP:</span> {entry.definitionJa}
                </p>
              </div>

              <Separator />

              <div data-testid="vocab-example" className="text-sm">
                <p className="text-muted-foreground text-xs mb-1">Example:</p>
                <p className="italic">&ldquo;{entry.exampleSentence}&rdquo;</p>
              </div>

              <Separator />

              <Button
                data-testid="vocab-save-button"
                onClick={onSave}
                disabled={isSaved}
                variant={isSaved ? 'secondary' : 'default'}
                className="w-full min-h-11"
              >
                {isSaved ? '保存済み' : '単語を保存'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compute popup position to keep it within viewport
 */
function computePopupPosition(position: { x: number; y: number }): React.CSSProperties {
  const popupWidth = 320;
  const popupHeight = 400;
  const padding = 16;

  let left = position.x;
  let top = position.y + 24;

  if (typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + popupWidth > viewportWidth - padding) {
      left = viewportWidth - popupWidth - padding;
    }
    if (left < padding) {
      left = padding;
    }
    if (top + popupHeight > viewportHeight - padding) {
      top = position.y - popupHeight - 8;
    }
    if (top < padding) {
      top = padding;
    }
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
}
