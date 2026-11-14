import { describe, it, expect } from 'vitest';
import type { HistorialEstadoEntregable } from '../models/HistorialEstadoEntregable';
import { ordenarMasRecientePrimero } from './historial-estados';

function fila(id: string, fechaActualizacion: string): HistorialEstadoEntregable {
  return { id, estado: { id: 'APROBADO', nombre: 'Aprobado' }, fechaActualizacion };
}

describe('ordenarMasRecientePrimero', () => {
  it('invierte un historial ascendente, no muta la entrada y manda al final una fecha inválida', () => {
    // Arrange
    const invalida = fila('x', 'no-es-fecha');
    const entrada = [
      fila('a', '2026-09-01T10:00:00Z'),
      invalida,
      fila('b', '2026-09-03T10:00:00Z'),
    ];

    // Act
    const resultado = ordenarMasRecientePrimero(entrada);

    // Assert
    expect(resultado.map((h) => h.id)).toEqual(['b', 'a', 'x']);
    expect(entrada.map((h) => h.id)).toEqual(['a', 'x', 'b']);
  });
});
