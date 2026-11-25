import { describe, it, expect } from 'vitest';
import {
  OPCIONES_ORDEN_PARTICIPACIONES,
  ordenamientoParticipaciones,
} from './orden-participaciones';

describe('ordenamientoParticipaciones', () => {
  it('siempre empieza por nombreProyecto y deja el orden elegido como criterio secundario', () => {
    // Assert
    expect(ordenamientoParticipaciones('nombreProyecto:ASC')).toEqual([
      'nombreProyecto:ASC',
      'nombreDocumento:ASC',
    ]);
    expect(ordenamientoParticipaciones('nombreProyecto:DESC')).toEqual([
      'nombreProyecto:DESC',
      'nombreDocumento:ASC',
    ]);
    expect(ordenamientoParticipaciones('nombreAsesor:DESC')).toEqual([
      'nombreProyecto:ASC',
      'nombreAsesor:DESC',
    ]);
  });

  it('ofrece once opciones con el proyecto A-Z como primera y sin ids repetidos', () => {
    // Arrange
    const ids = OPCIONES_ORDEN_PARTICIPACIONES.map((o) => o.id);

    // Assert
    expect(ids).toHaveLength(11);
    expect(ids[0]).toBe('nombreProyecto:ASC');
    expect(new Set(ids).size).toBe(11);
  });
});
