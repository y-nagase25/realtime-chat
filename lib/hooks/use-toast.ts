import { useCallback } from 'react';
import { type ExternalToast, toast } from 'sonner';

type ToastType = 'success' | 'warning' | 'error' | 'info';

/**
 * Toast hook for showing toast notifications
 */
export function useToast(description: string, type: ToastType, title: string = 'Notice') {
  const showToast = useCallback(() => {
    const toastProps: ExternalToast = {
      description: description,
      position: 'top-center',
      action: {
        label: 'OK',
        onClick: () => {
          toast.dismiss();
        },
      },
    };

    switch (type) {
      case 'success':
        toast.success(title, toastProps);
        break;
      case 'warning':
        toast.warning(title, toastProps);
        break;
      case 'error':
        toast.error(title, toastProps);
        break;
      case 'info':
        toast.info(title, toastProps);
        break;
    }
  }, [description, type, title]);

  return {
    showToast,
  };
}
