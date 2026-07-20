import { create } from 'zustand';

let _nextId = 0;

export type ToastLevel = 'success' | 'info' | 'debug' | 'error';

export interface Toast {
  id: string;
  level: ToastLevel;
  title: string;
  message?: string;
  /** Milisegundos antes de auto-cerrar. 0 = persistente. */
  duration: number;
}

const DEFAULT_DURATIONS: Record<ToastLevel, number> = {
  success: 4000,
  info:    4000,
  debug:   8000,
  error:   6000,
};

interface ToastStore {
  toasts: Toast[];
  push:    (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  push: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id:       String(++_nextId),
          duration: DEFAULT_DURATIONS[toast.level],
          ...toast,
        },
      ],
    })),

  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
