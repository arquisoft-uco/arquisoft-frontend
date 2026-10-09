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
  EN_EVALUACION: 'info',
  APROBADA: 'exito',
  APROBADA_CON_OBSERVACIONES: 'advertencia',
  NO_APROBADA: 'peligro',
  DESCARTADA: 'neutro',
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

function buscarVariante(tabla: TablaDeVariantes, id: string): VarianteBadge {
  return Object.prototype.hasOwnProperty.call(tabla, id) ? tabla[id] : 'neutro';
}

export function varianteEstadoFicha(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_FICHA, id);
}

export function varianteEstadoEvaluacion(id: string): VarianteBadge {
  return buscarVariante(VARIANTE_EVALUACION, id);
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
