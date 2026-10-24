import type { ToastLevel } from '../stores/toastStore';
import { useToastStore } from '../stores/toastStore';

type PushFn = (title: string, message?: string, duration?: number) => void;

function makePush(level: ToastLevel): PushFn {
  return (title, message, duration) => {
    useToastStore
      .getState()
      .push({ level, title, message, ...(duration !== undefined && { duration }) });
  };
}

export const toast = {
  success: makePush('success'),
  info: makePush('info'),
  error: makePush('error'),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
} as const;

export function useToast() {
  return toast;
}
