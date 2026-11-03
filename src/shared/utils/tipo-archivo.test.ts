import { describe, it, expect } from 'vitest';
import { aceptaDe, tipoContenidoDe } from './tipo-archivo';

const TIPOS = { pdf: 'application/pdf', md: 'text/markdown' };

describe('tipo-archivo', () => {
  it('resuelve el tipo por extensión sin importar mayúsculas y devuelve vacío si no la conoce', () => {
    // Assert
    expect(tipoContenidoDe(new File(['x'], 'Manual.PDF'), TIPOS)).toBe('application/pdf');
    expect(tipoContenidoDe(new File(['x'], 'notas.md', { type: '' }), TIPOS)).toBe('text/markdown');
    expect(tipoContenidoDe(new File(['x'], 'datos.zip'), TIPOS)).toBe('');
    expect(tipoContenidoDe(new File(['x'], 'sinextension'), TIPOS)).toBe('');
  });

  it('arma el valor del atributo accept con las extensiones de la tabla', () => {
    // Assert
    expect(aceptaDe(TIPOS)).toBe('.pdf,.md');
  });
});
