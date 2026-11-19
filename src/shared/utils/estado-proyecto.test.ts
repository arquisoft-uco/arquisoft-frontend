import { describe, it, expect } from 'vitest';
import {
  banderasCierreProyecto,
  ESTADO_PROYECTO_CANCELADO,
  ESTADO_PROYECTO_FINALIZADO,
} from './estado-proyecto';

describe('banderasCierreProyecto', () => {
  it('marca solo la bandera del estado cancelado o finalizado y ninguna en otro caso', () => {
    // Act & Assert
    expect(banderasCierreProyecto(ESTADO_PROYECTO_CANCELADO)).toEqual({
      proyectoFinalizado: false,
      proyectoCancelado: true,
    });
    expect(banderasCierreProyecto(ESTADO_PROYECTO_FINALIZADO)).toEqual({
      proyectoFinalizado: true,
      proyectoCancelado: false,
    });
    expect(banderasCierreProyecto('ACTIVO')).toEqual({
      proyectoFinalizado: false,
      proyectoCancelado: false,
    });
    expect(banderasCierreProyecto(undefined)).toEqual({
      proyectoFinalizado: false,
      proyectoCancelado: false,
    });
  });
});
