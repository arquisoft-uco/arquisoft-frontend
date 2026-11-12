import { describe, it, expect } from 'vitest';
import {
  leerEstadoProyecto,
  predicadoEstadoProyecto,
  proyectoCerrado,
  puedeDescargarPaquete,
  textoAlcanceEstadoProyecto,
} from './estado-proyecto';

function entregable(estadoId: string, finalizado = false, cancelado = false) {
  return {
    estadoEntregable: { id: estadoId },
    proyectoFinalizado: finalizado,
    proyectoCancelado: cancelado,
  };
}

describe('estado-proyecto', () => {
  it('lee el alcance, arma el predicado y el texto del resumen', () => {
    // Assert
    expect(leerEstadoProyecto('finalizados')).toBe('finalizados');
    expect(leerEstadoProyecto('otro')).toBe('activos');
    expect(leerEstadoProyecto('')).toBe('activos');
    expect(predicadoEstadoProyecto('activos')).toBeUndefined();
    expect(predicadoEstadoProyecto('finalizados')).toEqual({
      tipo: 'PREDICADO',
      campo: 'proyectoFinalizado',
      operador: 'ES',
      valor: 'true',
    });
    expect(textoAlcanceEstadoProyecto('activos')).toBe('de proyectos activos');
    expect(textoAlcanceEstadoProyecto('finalizados')).toBe('de proyectos finalizados');
  });

  it('proyectoCerrado y puedeDescargarPaquete aplican las reglas de cierre', () => {
    // Assert
    expect(proyectoCerrado(entregable('APROBADO'))).toBe(false);
    expect(proyectoCerrado(entregable('CERRADO', true))).toBe(true);
    expect(proyectoCerrado(entregable('CERRADO', false, true))).toBe(true);
    expect(puedeDescargarPaquete(entregable('CERRADO'))).toBe(true);
    expect(puedeDescargarPaquete(entregable('APROBADO'))).toBe(true);
    expect(puedeDescargarPaquete(entregable('CERRADO', true))).toBe(true);
    expect(puedeDescargarPaquete(entregable('APROBADO', true))).toBe(false);
    expect(puedeDescargarPaquete(entregable('CANCELADO'))).toBe(false);
    expect(puedeDescargarPaquete(entregable('CERRADO', false, true))).toBe(false);
  });
});
