import { describe, it, expect } from 'vitest';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { buscarArtefactos } from './buscar-artefactos';

function artefacto(id: string, nombreDocumento: string, nombreProyecto: string): ArtefactoAsesor {
  return {
    id,
    proyectoGrado: 'p-1',
    nombreProyecto,
    versionRepositorioArtefacto: 'r-1',
    nombreDocumento,
    versionDocumento: 1,
    nombreRepositorio: 'Repo',
  };
}

const CATALOGO = [
  artefacto('a-1', 'Acta de inicio', 'Sistema de riego'),
  artefacto('a-2', 'Cronograma', 'Huerta urbana'),
];

describe('buscarArtefactos', () => {
  it('coincide por documento o proyecto, sin distinguir mayúsculas ni tildes', () => {
    expect(buscarArtefactos(CATALOGO, 'ACTA')).toEqual(['a-1']);
    expect(buscarArtefactos(CATALOGO, 'huerta')).toEqual(['a-2']);
    expect(buscarArtefactos(CATALOGO, 'sístema')).toEqual(['a-1']);
  });

  it('texto vacío o sin coincidencias devuelve lista vacía', () => {
    expect(buscarArtefactos(CATALOGO, '   ')).toEqual([]);
    expect(buscarArtefactos(CATALOGO, 'zzz')).toEqual([]);
  });
});
