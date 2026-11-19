import { describe, it, expect } from 'vitest';
import {
  estaCerrado,
  filtrosEstadoProyecto,
  leerEstadoProyecto,
  OPCIONES_ESTADO_PROYECTO,
  textoAlcanceEstadoProyecto,
} from './estado-proyecto';

describe('estado del proyecto en los listados', () => {
  it('leerEstadoProyecto acepta solo los tres valores y cae en habilitados', () => {
    // Assert
    expect(leerEstadoProyecto('finalizados')).toBe('finalizados');
    expect(leerEstadoProyecto('cancelados')).toBe('cancelados');
    expect(leerEstadoProyecto('')).toBe('');
    ['habilitados', 'FINALIZADOS', 'otro'].forEach((valor) => {
      expect(leerEstadoProyecto(valor)).toBe('');
    });
    expect(OPCIONES_ESTADO_PROYECTO.map((opcion) => opcion.id)).toEqual([
      '',
      'finalizados',
      'cancelados',
    ]);
  });

  it('filtrosEstadoProyecto emite los dos false por defecto y un solo true en las demás', () => {
    // Assert
    expect(filtrosEstadoProyecto('')).toEqual([
      { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'false' },
      { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'false' },
    ]);
    expect(filtrosEstadoProyecto('finalizados')).toEqual([
      { tipo: 'PREDICADO', campo: 'proyectoFinalizado', operador: 'ES', valor: 'true' },
    ]);
    expect(filtrosEstadoProyecto('cancelados')).toEqual([
      { tipo: 'PREDICADO', campo: 'proyectoCancelado', operador: 'ES', valor: 'true' },
    ]);
  });

  it('textoAlcanceEstadoProyecto y estaCerrado reflejan el estado', () => {
    // Assert
    expect(textoAlcanceEstadoProyecto('')).toBe('de proyectos habilitados');
    expect(textoAlcanceEstadoProyecto('finalizados')).toBe('de proyectos finalizados');
    expect(textoAlcanceEstadoProyecto('cancelados')).toBe('de proyectos cancelados');
    expect(estaCerrado({ proyectoFinalizado: false, proyectoCancelado: false })).toBe(false);
    expect(estaCerrado({ proyectoFinalizado: true, proyectoCancelado: false })).toBe(true);
    expect(estaCerrado({ proyectoFinalizado: false, proyectoCancelado: true })).toBe(true);
  });
});
