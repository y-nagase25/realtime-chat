import { render, screen } from '@testing-library/react';
import { ReadingTimer } from '@/components/reading/ReadingTimer';
import { useTimer } from '@/lib/hooks/use-timer';
import type { ReadingLevel } from '@/lib/types/reading';
import { READING_LEVELS } from '@/lib/constants/reading';

vi.mock('@/lib/hooks/use-timer');
const mockUseTimer = vi.mocked(useTimer);

describe('ReadingTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTimer.mockReturnValue(0);
  });

  const renderComponent = (level: ReadingLevel = 'A2') => {
    return render(<ReadingTimer level={level} />);
  };

  describe('basic rendering', () => {
    it('renders timer display', () => {
      renderComponent();
      expect(screen.getByTestId('timer-display')).toBeInTheDocument();
    });

    it('renders target WPM display', () => {
      renderComponent();
      expect(screen.getByTestId('target-wpm')).toBeInTheDocument();
    });
  });

  describe('target WPM display', () => {
    it('renders target WPM based on A1 level', () => {
      renderComponent('A1');
      expect(screen.getByTestId('target-wpm')).toHaveTextContent(
        `目標: ${READING_LEVELS['A1'].targetWpmMin}-${READING_LEVELS['A1'].targetWpmMax} WPM`
      );
    });

    it('renders target WPM based on C1 level', () => {
      renderComponent('C1');
      expect(screen.getByTestId('target-wpm')).toHaveTextContent(
        `目標: ${READING_LEVELS['C1'].targetWpmMin}-${READING_LEVELS['C1'].targetWpmMax} WPM`
      );
    });
  });

  describe('elapsed time display format', () => {
    it('renders timer display with initial 0:00', () => {
      renderComponent();
      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:00');
    });

    it('renders timer display 0:30 when elapsedSeconds is 30 seconds', () => {
      mockUseTimer.mockReturnValue(30);
      renderComponent();
      expect(screen.getByTestId('timer-display')).toHaveTextContent('0:30');
    });

    it('renders timer display 1:23 when elapsedSeconds is 83 seconds', () => {
      mockUseTimer.mockReturnValue(83);
      renderComponent();
      expect(screen.getByTestId('timer-display')).toHaveTextContent('1:23');
    });

    it('renders timer display 12:34 when elapsedSeconds is 754 seconds', () => {
      mockUseTimer.mockReturnValue(754);
      renderComponent();
      expect(screen.getByTestId('timer-display')).toHaveTextContent('12:34');
    });
  });
});
