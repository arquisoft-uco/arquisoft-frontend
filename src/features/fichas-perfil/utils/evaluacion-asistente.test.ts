import { describe, it, expect } from 'vitest';
import type { EstadoEvaluacion, EvaluacionFichaPerfil } from '../models/fichas-perfil';
import {
  estadosParaDecidir,
  evaluacionEnEstadoFinal,
  textoObservacionesParaEstado,
} from './evaluacion-asistente';

const CATALOGO: EstadoEvaluacion[] = [
  { id: 'EN_EVALUACION', nombre: 'En Evaluación', descripcion: '' },
  { id: 'APROBADA', nombre: 'Aprobada', descripcion: '' },
  { id: 'APROBADA_CON_OBSERVACIONES', nombre: 'Aprobada Con Observaciones', descripcion: '' },
  { id: 'NO_APROBADA', nombre: 'No Aprobada', descripcion: '' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: '' },
];

function evaluacion(estadoEvaluacionId: string | null): EvaluacionFichaPerfil {
  return {
    id: 'ev-1',
    fichaPerfilId: 'f-1',
    fechaCreacion: '2026-10-01',
    estadoEvaluacionId,
    estadoEvaluacionNombre: null,
  };
}

describe('evaluacion-asistente', () => {
  it('estadosParaDecidir ofrece según las observaciones, en el orden del catálogo, sin En Evaluación ni Descartada', () => {
    // Act
    const sin = estadosParaDecidir(CATALOGO, false).map((e) => e.id);
    const con = estadosParaDecidir(CATALOGO, true).map((e) => e.id);

    // Assert
    expect(sin).toEqual(['APROBADA', 'NO_APROBADA']);
    expect(con).toEqual(['APROBADA_CON_OBSERVACIONES', 'NO_APROBADA']);
  });

  it('evaluacionEnEstadoFinal es true para los cuatro terminales y false para abierta o sin estado', () => {
    // Assert
    for (const id of ['APROBADA', 'APROBADA_CON_OBSERVACIONES', 'NO_APROBADA', 'DESCARTADA']) {
      expect(evaluacionEnEstadoFinal(evaluacion(id))).toBe(true);
    }
    expect(evaluacionEnEstadoFinal(evaluacion('EN_EVALUACION'))).toBe(false);
    expect(evaluacionEnEstadoFinal(evaluacion(null))).toBe(false);
  });

  it('textoObservacionesParaEstado distingue ninguna, una y varias observaciones', () => {
    // Assert
    expect(textoObservacionesParaEstado(0)).toBe(
      'No registraste observaciones, así que puedes aprobarla o no aprobarla.',
    );
    expect(textoObservacionesParaEstado(1)).toBe(
      'Registraste 1 observación, así que puedes aprobarla con observaciones o no aprobarla.',
    );
    expect(textoObservacionesParaEstado(3)).toBe(
      'Registraste 3 observaciones, así que puedes aprobarla con observaciones o no aprobarla.',
    );
  });
});
