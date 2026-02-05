import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { TrueFalseInput } from './TrueFalseInput';
import { mockTrueFalseQuestion } from '@/__test__/data/input';
import { CORRECT } from '@/lib/utils/reading-session';

describe('TrueFalseInput', () => {
  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TrueFalseInput question={mockTrueFalseQuestion} value={undefined} onChange={onChange} />
    );

    // Select 'true'
    await user.click(screen.getByLabelText(CORRECT));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
