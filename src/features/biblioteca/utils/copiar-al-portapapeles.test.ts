import { describe, it, expect, vi, afterEach } from 'vitest';
import { copiarAlPortapapeles } from './copiar-al-portapapeles';

function definirPortapapeles(valor: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value: valor, configurable: true });
}

describe('copiarAlPortapapeles', () => {
  afterEach(() => {
    definirPortapapeles(undefined);
  });

  it('devuelve true y escribe el texto cuando el portapapeles responde', async () => {
    // Arrange
    const writeText = vi.fn().mockResolvedValue(undefined);
    definirPortapapeles({ writeText });

    // Act
    const copiado = await copiarAlPortapapeles('https://s3.test/d');

    // Assert
    expect(copiado).toBe(true);
    expect(writeText).toHaveBeenCalledWith('https://s3.test/d');
  });

  it('devuelve false cuando la escritura rechaza o el portapapeles no existe', async () => {
    // Arrange
    definirPortapapeles({ writeText: vi.fn().mockRejectedValue(new Error('denegado')) });

    // Act / Assert
    expect(await copiarAlPortapapeles('x')).toBe(false);

    // Arrange
    definirPortapapeles(undefined);

    // Act / Assert
    expect(await copiarAlPortapapeles('x')).toBe(false);
  });
});
