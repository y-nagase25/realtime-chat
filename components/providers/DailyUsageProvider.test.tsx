import { screen, waitFor, act } from '@testing-library/react';
import { render } from '@/__test__/test-utils';
import { useDailyUsage } from '@/lib/hooks/context/useDailyUsage';
import { fetchUsageAggregates } from '@/lib/rate-limit/action';

// Mock Server Action
vi.mock('@/lib/rate-limit/action', () => ({
  fetchUsageAggregates: vi.fn(),
}));

// Mock fetchCsrfToken
vi.mock('@/lib/api-client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/api-client')>();
  return {
    ...mod,
    fetchCsrfToken: vi.fn(async () => {}),
  };
});

describe('DailyUsageProvider', () => {
  // Test component to consume the context
  const DummyConsumer = () => {
    const { usageAmount, fetchUsageAmount } = useDailyUsage();
    return (
      <>
        <div data-testid="usage-text">{usageAmount.total_tokens}</div>
        <button type="button" onClick={fetchUsageAmount} data-testid="update-button">
          Update
        </button>
      </>
    );
  };

  it('should fetch usage amount on initial render', async () => {
    // Mock Server Action return value
    vi.mocked(fetchUsageAggregates).mockResolvedValue({
      total_tokens: 1200,
      audio_duration_seconds: 60,
    });

    render(<DummyConsumer />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId('usage-text')).toHaveTextContent('1200');
    });
  });

  it('should update usage amount when fetchUsageAmount is called', async () => {
    const mockFetch = vi.mocked(fetchUsageAggregates);
    // Return different values for the first and second calls
    mockFetch.mockResolvedValueOnce({ total_tokens: 1200, audio_duration_seconds: 60 });
    mockFetch.mockResolvedValueOnce({ total_tokens: 2400, audio_duration_seconds: 120 });

    render(<DummyConsumer />);

    // Check initial state
    await waitFor(() => {
      expect(screen.getByTestId('usage-text')).toHaveTextContent('1200');
    });

    // Update by clicking the button
    await act(async () => {
      screen.getByTestId('update-button').click();
    });

    // Check updated state
    await waitFor(() => {
      expect(screen.getByTestId('usage-text')).toHaveTextContent('2400');
    });
  });
});
