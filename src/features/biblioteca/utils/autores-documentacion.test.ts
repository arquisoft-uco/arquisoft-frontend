import { describe, it, expect } from 'vitest';
import { nombresDeAutores } from './autores-documentacion';

const autor = (nombre: string) => ({ id: nombre, identificador: nombre, nombre });

describe('nombresDeAutores', () => {
  it('une los nombres según la cantidad y conserva el orden recibido', () => {
    // Act / Assert
    expect(nombresDeAutores([])).toBe('');
    expect(nombresDeAutores([autor('Ana')])).toBe('Ana');
    expect(nombresDeAutores([autor('Ana'), autor('Luis')])).toBe('Ana y Luis');
    expect(nombresDeAutores([autor('Luis'), autor('Ana'), autor('Pedro')])).toBe(
      'Luis, Ana y Pedro',
    );
  });

  it('usa «e» cuando el último nombre empieza por el sonido «i» (i, hi, con tilde o mayúscula)', () => {
    // Act / Assert
    expect(nombresDeAutores([autor('Ana'), autor('Ignacio')])).toBe('Ana e Ignacio');
    expect(nombresDeAutores([autor('Luis'), autor('Hilda')])).toBe('Luis e Hilda');
    expect(nombresDeAutores([autor('Ana'), autor('Íñigo')])).toBe('Ana e Íñigo');
    expect(nombresDeAutores([autor('A'), autor('B'), autor('Isabel')])).toBe('A, B e Isabel');
  });

  it('mantiene «y» cuando solo el primer nombre empieza por «i»', () => {
    // Act / Assert
    expect(nombresDeAutores([autor('Ignacio'), autor('Ana')])).toBe('Ignacio y Ana');
  });
});
