import { describe, it, expect } from 'vitest';
import type { EstadoFicha } from '../models/fichas-perfil';
import { estadosDestino } from './transiciones-estado-ficha';

const CATALOGO: EstadoFicha[] = [
  { id: 'EN_CONSTRUCCION', nombre: 'En Construccion', descripcion: 'a' },
  { id: 'DISPONIBLE_PARA_EVALUACION', nombre: 'Disponible Para Evaluacion', descripcion: 'b' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: 'c' },
];

function ids(origen: string) {
  return estadosDestino(origen, CATALOGO).map((e) => e.id);
}

describe('estadosDestino', () => {
  it('devuelve los destinos de la matriz desde cada origen, sin repetir el actual', () => {
    // Act / Assert
    expect(ids('EN_CONSTRUCCION')).toEqual(['DISPONIBLE_PARA_EVALUACION', 'DESCARTADA']);
    expect(ids('DISPONIBLE_PARA_EVALUACION')).toEqual(['EN_CONSTRUCCION', 'DESCARTADA']);
    expect(ids('DESCARTADA')).toEqual(['EN_CONSTRUCCION']);
  });

  it('conserva el estado del catálogo del backend', () => {
    // Act
    const [destino] = estadosDestino('DESCARTADA', CATALOGO);

    // Assert
    expect(destino).toBe(CATALOGO[0]);
  });

  it('devuelve vacío desde un estado final o desconocido, o con el catálogo vacío', () => {
    // Act / Assert
    expect(ids('APROBADA')).toEqual([]);
    expect(ids('NO_APROBADA')).toEqual([]);
    expect(ids('INEXISTENTE')).toEqual([]);
    expect(estadosDestino('EN_CONSTRUCCION', [])).toEqual([]);
  });
});
