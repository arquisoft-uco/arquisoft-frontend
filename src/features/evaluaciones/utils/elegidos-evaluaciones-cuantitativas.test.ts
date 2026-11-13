import { describe, it, expect } from 'vitest';
import { armarElegidos } from './elegidos-evaluaciones-cuantitativas';

const ITEMS = new Map([
  ['i-1', { id: 'i-1', nombre: 'Arquitectura', descripcion: 'd', categoriaId: 'c-1', valor: 50 }],
]);
const CATEGORIAS = new Map([['c-1', 'Técnica']]);

describe('armarElegidos', () => {
  it('describe categoría y puntaje, y marca «con observación» solo cuando el par la lleva', () => {
    // Act
    const resultado = armarElegidos(
      [
        { itemId: 'i-1', puntaje: 40 },
        { itemId: 'i-1', puntaje: 30, observacion: 'Falta detalle' },
      ],
      ITEMS,
      CATEGORIAS,
    );

    // Assert
    expect(resultado[0]).toEqual({
      id: 'i-1',
      etiqueta: 'Arquitectura',
      descripcion: 'Técnica · puntaje 40 de 50',
    });
    expect(resultado[1].descripcion).toBe('Técnica · puntaje 30 de 50 · con observación');
  });
});
