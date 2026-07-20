import type { ToastLevel } from '../stores/toastStore';
import { useToastStore } from '../stores/toastStore';

type PushFn = (title: string, message?: string, duration?: number) => void;

function makePush(level: ToastLevel): PushFn {
  return (title, message, duration) => {
    useToastStore.getState().push({ level, title, message, ...(duration !== undefined && { duration }) });
  };
}

/** Objeto singleton — usable fuera de componentes React. */
export const toast = {
  success: makePush('success'),
  info:    makePush('info'),
  debug:   makePush('debug'),
  error:   makePush('error'),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
} as const;

/** Hook — proporciona las mismas funciones dentro de componentes React. */
export function useToast() {
  return toast;
}
