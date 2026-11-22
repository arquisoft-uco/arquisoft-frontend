import { describe, it, expect } from 'vitest';
import { marcarItemsPendientes, soloPendientes } from './items-pendientes';

const CATALOGO = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('items-pendientes', () => {
  it('marca como pendiente lo que no está en las realizadas y conserva el orden del catálogo', () => {
    // Arrange
    const realizadas = [{ item: { id: 'c' } }, { item: { id: 'a' } }];

    // Act
    const filas = marcarItemsPendientes(CATALOGO, realizadas);

    // Assert
    expect(filas.map((f) => [f.item.id, f.pendiente])).toEqual([
      ['a', false],
      ['b', true],
      ['c', false],
    ]);
    expect(soloPendientes(filas)).toEqual([{ id: 'b' }]);
  });

  it('con realizadas vacías todo queda pendiente y con catálogo vacío no hay filas', () => {
    // Arrange / Act
    const todas = marcarItemsPendientes(CATALOGO, []);
    const ninguna = marcarItemsPendientes([], [{ item: { id: 'a' } }]);

    // Assert
    expect(todas.every((f) => f.pendiente)).toBe(true);
    expect(ninguna).toEqual([]);
    expect(soloPendientes(ninguna)).toEqual([]);
  });
});
