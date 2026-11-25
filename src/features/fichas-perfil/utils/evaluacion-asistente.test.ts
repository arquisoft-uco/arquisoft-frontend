import { describe, it, expect } from 'vitest';
import type { EstadoEvaluacion, EvaluacionFichaPerfil } from '../models/fichas-perfil';
import {
  accionesEvaluacionRepresentante,
  estadosParaDecidir,
  evaluacionDescartada,
  evaluacionEnCurso,
  evaluacionEnEstadoFinal,
  evaluacionVigente,
  fichaAdmiteEvaluacion,
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

  it('evaluacionEnEstadoFinal es true para los tres terminales y false para abierta, descartada o sin estado', () => {
    // Assert
    for (const id of ['APROBADA', 'APROBADA_CON_OBSERVACIONES', 'NO_APROBADA']) {
      expect(evaluacionEnEstadoFinal(evaluacion(id))).toBe(true);
    }
    expect(evaluacionEnEstadoFinal(evaluacion('EN_EVALUACION'))).toBe(false);
    expect(evaluacionEnEstadoFinal(evaluacion('DESCARTADA'))).toBe(false);
    expect(evaluacionEnEstadoFinal(evaluacion(null))).toBe(false);
  });

  it('evaluacionDescartada y evaluacionEnCurso distinguen descartada, final, abierta y sin estado', () => {
    // Assert
    expect(evaluacionDescartada(evaluacion('DESCARTADA'))).toBe(true);
    expect(evaluacionDescartada(evaluacion('APROBADA'))).toBe(false);
    expect(evaluacionEnCurso(evaluacion('EN_EVALUACION'))).toBe(true);
    expect(evaluacionEnCurso(evaluacion(null))).toBe(true);
    expect(evaluacionEnCurso(evaluacion('DESCARTADA'))).toBe(false);
    expect(evaluacionEnCurso(evaluacion('NO_APROBADA'))).toBe(false);
  });

  it('evaluacionVigente devuelve la última de la lista y undefined si está vacía', () => {
    // Arrange
    const primera = { ...evaluacion('APROBADA'), id: 'ev-0' };
    const ultima = { ...evaluacion('DESCARTADA'), id: 'ev-2' };

    // Assert
    expect(evaluacionVigente([primera, ultima])).toBe(ultima);
    expect(evaluacionVigente([])).toBeUndefined();
  });

  it('fichaAdmiteEvaluacion solo acepta DISPONIBLE_PARA_EVALUACION', () => {
    // Assert
    expect(fichaAdmiteEvaluacion('DISPONIBLE_PARA_EVALUACION')).toBe(true);
    expect(fichaAdmiteEvaluacion('EN_REVISION')).toBe(false);
    expect(fichaAdmiteEvaluacion(undefined)).toBe(false);
  });

  describe('accionesEvaluacionRepresentante', () => {
    const SIN_ACCION = { principal: null, puedeDescartar: false, descartadaSinAccion: false };

    it.each([
      [
        'sin evaluación y ficha disponible',
        undefined,
        true,
        { ...SIN_ACCION, principal: 'iniciar' },
      ],
      ['sin evaluación y ficha no disponible', undefined, false, SIN_ACCION],
      [
        'en curso y ficha disponible',
        evaluacion('EN_EVALUACION'),
        true,
        { ...SIN_ACCION, principal: 'evaluar', puedeDescartar: true },
      ],
      [
        'sin estado y ficha disponible',
        evaluacion(null),
        true,
        { ...SIN_ACCION, principal: 'evaluar', puedeDescartar: true },
      ],
      [
        'en curso y ficha no disponible',
        evaluacion('EN_EVALUACION'),
        false,
        { ...SIN_ACCION, principal: 'evaluar' },
      ],
      [
        'descartada y ficha disponible',
        evaluacion('DESCARTADA'),
        true,
        { ...SIN_ACCION, principal: 'reanudar' },
      ],
      [
        'descartada y ficha no disponible',
        evaluacion('DESCARTADA'),
        false,
        { ...SIN_ACCION, descartadaSinAccion: true },
      ],
      ['aprobada y ficha disponible', evaluacion('APROBADA'), true, SIN_ACCION],
      ['no aprobada y ficha no disponible', evaluacion('NO_APROBADA'), false, SIN_ACCION],
    ])('%s', (_caso, vigente, fichaDisponible, esperado) => {
      // Assert
      expect(accionesEvaluacionRepresentante({ vigente, fichaDisponible })).toEqual(esperado);
    });
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
