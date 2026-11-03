import { describe, it, expect } from 'vitest';
import type { ObservacionRevision } from '../models/ObservacionRevision';
import { contarSinCerrar, textoContadorSinCerrar } from './observaciones-revision-anterior';

function observacion(id: string, estadoId: string): ObservacionRevision {
  return {
    id,
    revisionAsesorId: 'r-1',
    descripcion: id,
    estadoId,
    estadoNombre: estadoId,
  };
}

describe('observaciones de la revisión anterior', () => {
  it('cuenta como sin cerrar todo estado distinto de CERRADA, incluida REABIERTA', () => {
    // Act
    const conteo = contarSinCerrar([
      observacion('a', 'CERRADA'),
      observacion('b', 'SOLUCIONADA'),
      observacion('c', 'REABIERTA'),
      observacion('d', 'NUEVA'),
    ]);
    const vacio = contarSinCerrar([]);

    // Assert
    expect(conteo).toEqual({ total: 4, sinCerrar: 3 });
    expect(vacio).toEqual({ total: 0, sinCerrar: 0 });
  });

  it('el texto del contador usa sin cerrar de total', () => {
    // Assert
    expect(textoContadorSinCerrar({ total: 4, sinCerrar: 3 })).toBe('3 de 4 sin cerrar');
  });
});
