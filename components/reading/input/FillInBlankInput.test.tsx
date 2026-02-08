import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { FillInBlankInput } from './FillInBlankInput';
import { mockFillInBlankQuestion } from '@/__test__/data/input';

describe('FillInBlankInput', () => {
  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FillInBlankInput question={mockFillInBlankQuestion} value={''} onChange={onChange} />);

    // Select 'London' (index 1)
    await user.type(screen.getByTestId(`input-${mockFillInBlankQuestion.id}`), 'Paris');

    expect(onChange).toHaveBeenCalledTimes(5);
  });
});
