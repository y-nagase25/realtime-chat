import { useReducer } from 'react';
import type { Passage, ComprehensionQuestion, QuestionResult } from '@/lib/types/reading';

// State definitions using Discriminated Unions
type ReadingState =
  | { phase: 'settings' }
  | { phase: 'reading'; passage: Passage; questions: ComprehensionQuestion[] }
  | {
      phase: 'results';
      passage: Passage;
      questions: ComprehensionQuestion[];
      results: QuestionResult[];
    };

type ReadingAction =
  | { type: 'START_READING'; payload: Passage }
  | { type: 'SUBMIT_ANSWERS'; payload: QuestionResult[] }
  | { type: 'RESET' };

// Reducer function
function readingReducer(state: ReadingState, action: ReadingAction): ReadingState {
  if (process.env.NODE_ENV === 'development') console.log(state, action.type);

  switch (action.type) {
    case 'START_READING': {
      return {
        phase: 'reading',
        passage: action.payload,
        questions: action.payload.questions,
      };
    }
    case 'SUBMIT_ANSWERS': {
      // Ensure we transition from reading phase
      if (state.phase !== 'reading') return state;
      return {
        phase: 'results',
        passage: state.passage,
        questions: state.questions,
        results: action.payload,
      };
    }
    case 'RESET': {
      return { phase: 'settings' };
    }
    default: {
      return state;
    }
  }
}

export function useReadingReducer() {
  return useReducer(readingReducer, { phase: 'settings' });
}
