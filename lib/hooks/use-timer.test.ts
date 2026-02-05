import { renderHook, act } from '@testing-library/react';
import { useTimer } from './use-timer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return elapsed seconds', () => {
    const { result } = renderHook(() => useTimer());
    expect(result.current).toBe(0);
  });

  it('should increment elapsedSeconds when timer is running', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(3);
  });

  it('should clear interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useTimer());

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
