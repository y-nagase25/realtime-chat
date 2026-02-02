import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './use-toast';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('showToast', () => {
    it('should call toast.success when type is success', () => {
      const description = 'Success description';
      const type = 'success';
      const title = 'Success Title';

      const { result } = renderHook(() => useToast(description, type, title));

      act(() => {
        result.current.showToast();
      });

      expect(toast.success).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          description: description,
          position: 'top-center',
          action: expect.objectContaining({
            label: 'OK',
          }),
        })
      );
    });

    it('should call toast.warning when type is warning', () => {
      const description = 'Warning description';
      const type = 'warning';
      const title = 'Warning Title';

      const { result } = renderHook(() => useToast(description, type, title));

      act(() => {
        result.current.showToast();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          description: description,
          position: 'top-center',
        })
      );
    });

    it('should call toast.error when type is error', () => {
      const description = 'Error description';
      const type = 'error';
      const title = 'Error Title';

      const { result } = renderHook(() => useToast(description, type, title));

      act(() => {
        result.current.showToast();
      });

      expect(toast.error).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          description: description,
          position: 'top-center',
        })
      );
    });

    it('should call toast.info when type is info', () => {
      const description = 'Info description';
      const type = 'info';
      const title = 'Info Title';

      const { result } = renderHook(() => useToast(description, type, title));

      act(() => {
        result.current.showToast();
      });

      expect(toast.info).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          description: description,
          position: 'top-center',
        })
      );
    });

    it('should use default title "Notice" when title is not provided', () => {
      const description = 'Default title description';
      const type = 'success';

      const { result } = renderHook(() => useToast(description, type));

      act(() => {
        result.current.showToast();
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Notice',
        expect.objectContaining({
          description: description,
          position: 'top-center',
        })
      );
    });

    it('should configure dismissal action correctly', () => {
      const description = 'Action description';
      const type = 'success';

      const { result } = renderHook(() => useToast(description, type));

      act(() => {
        result.current.showToast();
      });

      // Get the calls to toast.success
      const calls = vi.mocked(toast.success).mock.calls;
      const toastProps = calls[0][1] as any;

      expect(toastProps.action).toBeDefined();
      expect(toastProps.action.label).toBe('OK');

      // Execute the onClick handler
      toastProps.action.onClick();
      expect(toast.dismiss).toHaveBeenCalled();
    });
  });
});
