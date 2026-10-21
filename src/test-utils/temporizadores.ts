import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { act } from './render';

// Testing Library solo reconoce los temporizadores falsos de Vitest si existe jest.advanceTimersByTime;
// sin este puente userEvent se cuelga esperando un temporizador que nadie avanza.
export function usarTemporizadoresFalsos() {
  vi.useFakeTimers();
  Object.assign(globalThis, {
    jest: { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) },
  });
  return userEvent.setup({
    advanceTimers: (ms) => {
      vi.advanceTimersByTime(ms);
    },
  });
}

export function avanzar(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

export function restaurarTemporizadores() {
  vi.useRealTimers();
  Reflect.deleteProperty(globalThis, 'jest');
}
