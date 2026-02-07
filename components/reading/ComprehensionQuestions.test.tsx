import { render, screen } from '@testing-library/react';
import { ComprehensionQuestions } from './ComprehensionQuestions';
import { mockQuestions } from '@/__test__/data/input';

describe('ComprehensionQuestions', () => {
  const onSubmit = vi.fn();
  const passageContent = 'The capital of France is Paris.';

  const renderComponent = () => {
    render(
      <ComprehensionQuestions
        questions={mockQuestions}
        onSubmit={onSubmit}
        isSubmitting={false}
        passageContent={passageContent}
      />
    );
  };

  describe('default rendering', () => {
    it('renders correctly', () => {
      renderComponent();
      expect(screen.getByTestId('comprehension-questions')).toBeInTheDocument();
    });
  });
});
