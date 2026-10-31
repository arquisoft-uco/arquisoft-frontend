import { describe, it, expect } from 'vitest';
import type { ParticipacionArtefacto } from '../models/ParticipacionArtefacto';
import { agruparPorProyecto } from './agrupar-participaciones';

function participacion(
  id: string,
  proyectoGrado: string,
  nombreProyecto: string,
  nombreDocumento: string,
): ParticipacionArtefacto {
  return {
    id,
    proyectoGrado,
    nombreProyecto,
    nombreDocumento,
    versionRepositorioArtefacto: `v-${id}`,
    versionDocumento: 1,
    nombreRepositorio: 'Repositorio base',
    asesor: 'u-1',
    nombreAsesor: 'Laura Gómez',
  };
}

describe('agruparPorProyecto', () => {
  it('agrupa por id de proyecto conservando el orden recibido', () => {
    // Arrange
    const lista = [
      participacion('a-1', 'p-1', 'Riego', 'Acta'),
      participacion('a-2', 'p-1', 'Riego', 'Anteproyecto'),
      participacion('a-3', 'p-2', 'Domótica', 'Acta'),
    ];

    // Act
    const grupos = agruparPorProyecto(lista);

    // Assert
    expect(grupos.map((g) => g.proyectoGrado)).toEqual(['p-1', 'p-2']);
    expect(grupos[0].nombreProyecto).toBe('Riego');
    expect(grupos[0].participaciones.map((p) => p.id)).toEqual(['a-1', 'a-2']);
    expect(grupos[1].participaciones.map((p) => p.id)).toEqual(['a-3']);
  });

  it('separa dos proyectos con el mismo nombre y distinto id', () => {
    // Arrange
    const lista = [
      participacion('a-1', 'p-1', 'Riego', 'Acta'),
      participacion('a-2', 'p-2', 'Riego', 'Acta'),
    ];

    // Act
    const grupos = agruparPorProyecto(lista);

    // Assert
    expect(grupos).toHaveLength(2);
  });

  it('devuelve una lista vacía cuando no hay participaciones', () => {
    // Act & Assert
    expect(agruparPorProyecto([])).toEqual([]);
  });
});
