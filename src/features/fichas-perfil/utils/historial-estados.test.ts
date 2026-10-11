import { describe, it, expect } from 'vitest';
import { ordenarMasRecientePrimero } from './historial-estados';

describe('ordenarMasRecientePrimero', () => {
  it('ordena del más reciente al más antiguo, no muta el original y deja la fecha inválida al final', () => {
    // Arrange
    const original = [
      { id: 'e-1', nombre: 'Creada', fechaActualizacion: '2026-01-01T10:00:00' },
      { id: 'e-x', nombre: 'Sin fecha', fechaActualizacion: 'no-es-fecha' },
      { id: 'e-3', nombre: 'Aprobada', fechaActualizacion: '2026-03-01T10:00:00' },
      { id: 'e-2', nombre: 'En revisión', fechaActualizacion: '2026-02-01T10:00:00' },
    ];
    const copia = [...original];

    // Act
    const resultado = ordenarMasRecientePrimero(original);

    // Assert
    expect(resultado.map((e) => e.id)).toEqual(['e-3', 'e-2', 'e-1', 'e-x']);
    expect(original).toEqual(copia);
  });
});
