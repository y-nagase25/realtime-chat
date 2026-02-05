import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { mockMultipleChoiceQuestion } from '@/__test__/data/input';

describe('MultipleChoiceInput', () => {
  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceInput question={mockMultipleChoiceQuestion} value={0} onChange={onChange} />
    );
    screen.debug();

    // Select 'London' (index 1)
    await user.click(screen.getByLabelText('London'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
