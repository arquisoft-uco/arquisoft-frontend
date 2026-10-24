import { describe, it, expect } from 'vitest';
import { ordenarMasRecientePrimero } from './historial-estados';

function paso(id: string, fechaActualizacion: string) {
  return { id, estado: { id: `E-${id}`, nombre: id }, fechaActualizacion };
}

describe('ordenarMasRecientePrimero', () => {
  it('ordena del más reciente al más antiguo, no muta el original y deja la fecha inválida al final', () => {
    // Arrange
    const original = [
      paso('h-1', '2026-01-01T10:00:00Z'),
      paso('h-x', 'no-es-fecha'),
      paso('h-3', '2026-03-01T10:00:00Z'),
      paso('h-2', '2026-02-01T10:00:00Z'),
    ];
    const copia = [...original];

    // Act
    const resultado = ordenarMasRecientePrimero(original);

    // Assert
    expect(resultado.map((e) => e.id)).toEqual(['h-3', 'h-2', 'h-1', 'h-x']);
    expect(original).toEqual(copia);
  });
});
