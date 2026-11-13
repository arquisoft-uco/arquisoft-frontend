import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { MENSAJES_VALIDACION } from '../../../shared/validation';

const TEXTO_TAREA_DUPLICADA = 'Ya hay una tarea con esa descripción en tu mapa de ruta.';
const TEXTO_ASESOR_NO_ASIGNADO =
  'Ese asesor no está asignado a tu proyecto de grado. Elige otro e inténtalo de nuevo.';

// Los textos propios existen porque el message del backend trae UUID, estado o fechas crudos.
export function mensajeErrorMapaRuta(err: unknown): string {
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO')) {
    return 'El proyecto ya no está disponible. Actualiza la lista e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PROPIETARIO')) {
    return 'Solo el coordinador asignado al proyecto puede crear su mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO')) {
    return 'El proyecto ya no está en proceso y no admite mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_DUPLICADO')) {
    return 'Este proyecto ya tiene un mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_FECHA_FIN_NO_POSTERIOR')) {
    return 'La fecha de fin debe ser posterior a la de inicio';
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function campoDeErrorMapaRuta(err: unknown): 'proyectoGrado' | 'fechaFin' | null {
  if (
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_ENCONTRADO') ||
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PROPIETARIO') ||
    hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO') ||
    hasApiErrorCode(err, 'MAPA_RUTA_DUPLICADO')
  ) {
    return 'proyectoGrado';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_FECHA_FIN_NO_POSTERIOR')) return 'fechaFin';
  return null;
}

export function mensajeErrorCambioFechaFin(err: unknown): string {
  if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) {
    return 'El mapa de ruta ya no está disponible. Actualiza la lista e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_PROPIETARIO')) {
    return 'Solo el coordinador asignado al proyecto puede cambiar la fecha de fin de su mapa de ruta.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO')) {
    return 'El proyecto ya no está en proceso y su mapa de ruta no admite cambios.';
  }
  if (hasApiErrorCode(err, 'MAPA_RUTA_FECHA_FIN_NO_POSTERIOR')) {
    return MENSAJES_VALIDACION.fechaFinPosterior;
  }
  return getApiErrorMessage(err, 'Verifica la fecha e inténtalo nuevamente.');
}

export function mensajeErrorCambioEstadoTarea(err: unknown): string {
  if (hasApiErrorCode(err, 'TRANSICION_ESTADO_ITEM_NO_PERMITIDA')) {
    return 'La tarea ya no admite ese cambio de estado. Revisa su estado actual e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
    return 'La tarea ya no está disponible. Vuelve a tus tareas e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function mensajeErrorModificarTarea(err: unknown): string {
  if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
    return 'La tarea ya no está disponible. Vuelve a tus tareas e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'TAREA_DUPLICADA')) {
    return TEXTO_TAREA_DUPLICADA;
  }
  if (hasApiErrorCode(err, 'ASESOR_NO_ASIGNADO_PROYECTO_GRADO')) {
    return TEXTO_ASESOR_NO_ASIGNADO;
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function mensajeErrorEliminarTarea(err: unknown): string {
  if (hasApiErrorCode(err, 'TAREA_NO_REMOVIBLE')) {
    return 'La tarea ya no se puede eliminar en su estado actual. Revisa su estado e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
    return 'La tarea ya no está disponible. Vuelve a tus tareas e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

export function campoDeErrorModificarTarea(err: unknown): 'descripcion' | 'asesor' | null {
  if (hasApiErrorCode(err, 'TAREA_DUPLICADA')) return 'descripcion';
  if (hasApiErrorCode(err, 'ASESOR_NO_ASIGNADO_PROYECTO_GRADO')) return 'asesor';
  return null;
}

export function mensajeErrorAsignarTarea(err: unknown): string {
  if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) {
    return 'Tu mapa de ruta ya no está disponible. Actualiza la página e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'PROYECTO_GRADO_NO_EN_PROCESO')) {
    return 'Tu proyecto de grado ya no está en proceso y no admite nuevas tareas.';
  }
  if (hasApiErrorCode(err, 'TAREA_DUPLICADA')) return TEXTO_TAREA_DUPLICADA;
  if (hasApiErrorCode(err, 'ASESOR_NO_ASIGNADO_PROYECTO_GRADO')) return TEXTO_ASESOR_NO_ASIGNADO;
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function mensajeErrorAgregarPlanEstimado(err: unknown): string {
  if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
    return 'La tarea ya no está disponible. Vuelve a tus tareas e inténtalo de nuevo.';
  }
  if (hasApiErrorCode(err, 'PLAN_ESTIMADO_DUPLICADO')) {
    return 'Esta tarea ya tiene un plan estimado.';
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function campoDeErrorAgregarPlanEstimado(err: unknown): 'tiempoEstimadoDias' | null {
  if (hasApiErrorCode(err, 'PLAN_ESTIMADO_TIEMPO_EXCEDE_PLAZO')) return 'tiempoEstimadoDias';
  return null;
}

export function mensajeErrorModificarPlanEstimado(err: unknown): string {
  if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) {
    return 'El plan estimado ya no está disponible. Actualiza el detalle de la tarea e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function mensajeErrorModificarPlanReal(err: unknown): string {
  if (hasApiErrorCode(err, 'PLAN_REAL_NO_ENCONTRADO')) {
    return 'El plan real ya no está disponible. Actualiza el detalle de la tarea e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.');
}

export function campoDeErrorModificarPlanReal(
  err: unknown,
): 'tiempoRealDias' | 'descripcionReal' | null {
  if (
    hasApiErrorCode(err, 'PLAN_REAL_TIEMPO_REQUERIDO') ||
    hasApiErrorCode(err, 'PLAN_REAL_TIEMPO_INVALIDO')
  ) {
    return 'tiempoRealDias';
  }
  if (hasApiErrorCode(err, 'PLAN_REAL_DESCRIPCION_DEMASIADO_LARGA')) return 'descripcionReal';
  return null;
}

export function mensajeErrorEliminarPlanEstimado(err: unknown): string {
  if (hasApiErrorCode(err, 'PLAN_ESTIMADO_NO_ENCONTRADO')) {
    return 'El plan estimado ya no está disponible. Actualiza el detalle de la tarea e inténtalo de nuevo.';
  }
  return getApiErrorMessage(err, 'No se pudo remover el plan estimado. Inténtalo de nuevo.');
}

export function campoDeErrorModificarPlanEstimado(err: unknown): 'descripcionEstimado' | null {
  if (hasApiErrorCode(err, 'PLAN_ESTIMADO_DESCRIPCION_DEMASIADO_LARGA')) {
    return 'descripcionEstimado';
  }
  return null;
}

export function campoDeErrorAsignarTarea(err: unknown): 'descripcion' | 'asesor' | null {
  if (hasApiErrorCode(err, 'TAREA_DUPLICADA')) return 'descripcion';
  if (hasApiErrorCode(err, 'ASESOR_NO_ASIGNADO_PROYECTO_GRADO')) return 'asesor';
  return null;
}
