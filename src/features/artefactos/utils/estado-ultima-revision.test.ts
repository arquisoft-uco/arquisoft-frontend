import { describe, it, expect } from 'vitest';
import { idEstadoUltimaRevision, varianteEstadoUltimaRevision } from './estado-ultima-revision';

const ESTADOS = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
  { id: 'RESUELTA', nombre: 'Resuelta', descripcion: '' },
];

describe('varianteEstadoUltimaRevision', () => {
  it('usa la variante del id del estado con ese nombre y cae a neutro sin coincidencia', () => {
    // Assert
    expect(varianteEstadoUltimaRevision(ESTADOS, 'Pendiente')).toBe('advertencia');
    expect(varianteEstadoUltimaRevision(ESTADOS, 'Resuelta')).toBe('exito');
    expect(varianteEstadoUltimaRevision(ESTADOS, 'Desconocido')).toBe('neutro');
    expect(varianteEstadoUltimaRevision([], 'Pendiente')).toBe('neutro');
  });
});

describe('idEstadoUltimaRevision', () => {
  it('devuelve el id del estado con ese nombre y undefined sin coincidencia', () => {
    // Assert
    expect(idEstadoUltimaRevision(ESTADOS, 'Resuelta')).toBe('RESUELTA');
    expect(idEstadoUltimaRevision(ESTADOS, 'Desconocido')).toBeUndefined();
  });
});
