import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '../../test-utils/render';
import { useDebouncedValue } from './useDebouncedValue';

function avanzar(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('conserva el valor anterior hasta cumplirse el retardo y entonces entrega el nuevo', () => {
    // Arrange
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ valor }) => useDebouncedValue(valor), {
      initialProps: { valor: 'a' },
    });

    // Act
    rerender({ valor: 'ab' });
    avanzar(299);

    // Assert
    expect(result.current).toBe('a');

    // Act
    avanzar(1);

    // Assert
    expect(result.current).toBe('ab');
  });

  it('un cambio antes de cumplirse el retardo reinicia la espera', () => {
    // Arrange
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ valor }) => useDebouncedValue(valor), {
      initialProps: { valor: 'a' },
    });
    rerender({ valor: 'ab' });
    avanzar(200);

    // Act
    rerender({ valor: 'abc' });
    avanzar(299);

    // Assert
    expect(result.current).toBe('a');

    // Act
    avanzar(1);

    // Assert
    expect(result.current).toBe('abc');
  });
});
