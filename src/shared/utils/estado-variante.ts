import type { VarianteBadge } from '../components/ui/Badge';

type TablaDeVariantes = Record<string, VarianteBadge>;

const VARIANTE_FICHA: TablaDeVariantes = {
  EN_CONSTRUCCION: 'neutro',
  DISPONIBLE_PARA_EVALUACION: 'advertencia',
  APROBADA: 'exito',
  APROBADA_CON_OBSERVACIONES: 'advertencia',
  NO_APROBADA: 'peligro',
  DESCARTADA: 'neutro',
};

const VARIANTE_EVALUACION: TablaDeVariantes = {
  PENDIENTE: 'advertencia',
  EN_PROGRESO: 'info',
  FINALIZADA: 'exito',
  EN_EVALUACION: 'info',
  APROBADA: 'exito',
  APROBADA_CON_OBSERVACIONES: 'advertencia',
  NO_APROBADA: 'peligro',
  DESCARTADA: 'neutro',
};

const VARIANTE_EVALUACION_JURADO: TablaDeVariantes = {
  PENDIENTE_POR_EVALUAR: 'advertencia',
  EVALUADA: 'exito',
};

const VARIANTE_USUARIO: TablaDeVariantes = {
  ACTIVO: 'exito',
  INACTIVO: 'neutro',
};

const VARIANTE_RESPUESTA: TablaDeVariantes = {
  APROBADA: 'exito',
  NO_APROBADA: 'peligro',
  EN_REVISION: 'info',
};

const VARIANTE_REVISION: TablaDeVariantes = {
  NUEVA: 'info',
  VISUALIZADA: 'neutro',
  EN_PROGRESO: 'advertencia',
  CORRECCION_DISPONIBLE: 'advertencia',
  CERRADA: 'exito',
};

const VARIANTE_OBSERVACION: TablaDeVariantes = {
  PENDIENTE: 'advertencia',
  EN_PROGRESO: 'info',
  CERRADO: 'exito',
};

const VARIANTE_PROYECTO: TablaDeVariantes = {
  EN_PROCESO: 'info',
  LISTO_PARA_REVISION: 'advertencia',
  ATRASADO: 'peligro',
  FINALIZADO: 'exito',
};

const VARIANTE_ASESOR_PROYECTO: TablaDeVariantes = {
  ASIGNADO: 'exito',
  FINALIZADO: 'neutro',
};

const VARIANTE_REVISION_ASESOR: TablaDeVariantes = {
  PENDIENTE: 'advertencia',
  EN_PROGRESO: 'info',
  RESUELTA: 'exito',
  CERRADA: 'neutro',
};

const VARIANTE_OBSERVACION_ARTEFACTO: TablaDeVariantes = {
  NUEVA: 'info',
  EN_PROGRESO: 'advertencia',
  SOLUCIONADA: 'exito',
  CERRADA: 'neutro',
  REABIERTA: 'peligro',
};

const VARIANTE_ENTREGABLE: TablaDeVariantes = {
  DISPONIBLE_EVALUACION: 'advertencia',
  EN_EVALUACION: 'info',
  APROBADO_CON_OBSERVACIONES: 'advertencia',
  APROBADO: 'exito',
  RECHAZADO: 'peligro',
  CANCELADO: 'neutro',
  CERRADO: 'neutro',
};

function buscarVariante(tabla: TablaDeVariantes, id: string): VarianteBadge {
  return Object.prototype.hasOwnProperty.call(tabla, id) ? tabla[id] : 'neutro';
}

export function varianteEstadoFicha(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_FICHA, id);
}

export function varianteEstadoEvaluacion(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_EVALUACION, id);
}

export function varianteEstadoEvaluacionJurado(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_EVALUACION_JURADO, id);
}

export function varianteEstadoUsuario(estadoId: string, vigente: boolean): VarianteBadge {
  if (!vigente) return 'peligro';
  return buscarVariante(VARIANTE_USUARIO, estadoId);
}

export function varianteEstadoRespuesta(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_RESPUESTA, id);
}

export function varianteEstadoRevision(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_REVISION, id);
}

export function varianteEstadoObservacion(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_OBSERVACION, id);
}

export function varianteEstadoProyecto(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_PROYECTO, id);
}

export function varianteEstadoAsesorProyecto(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_ASESOR_PROYECTO, id);
}

export function varianteEstadoRevisionAsesor(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_REVISION_ASESOR, id);
}

export function varianteEstadoObservacionArtefacto(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_OBSERVACION_ARTEFACTO, id);
}

export function varianteEstadoEntregable(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_ENTREGABLE, id);
}
