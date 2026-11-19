export const ESTADO_PROYECTO_CANCELADO = 'CANCELADO';
export const ESTADO_PROYECTO_FINALIZADO = 'FINALIZADO';

export function banderasCierreProyecto(estadoId: string | undefined): {
  proyectoFinalizado: boolean;
  proyectoCancelado: boolean;
} {
  return {
    proyectoFinalizado: estadoId === ESTADO_PROYECTO_FINALIZADO,
    proyectoCancelado: estadoId === ESTADO_PROYECTO_CANCELADO,
  };
}
