import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { MOTIVO_NO_CERRABLE } from './estados-entregable';

const SIN_ARTEFACTOS_PARA_PAQUETE = 'ENTREGABLES_ARTEFACTO_SIN_ARTEFACTOS_PARA_PAQUETE';
const PAQUETE_DESACTUALIZADO = 'ENTREGABLES_PAQUETE_ENTREGABLE_DESACTUALIZADO';
const VIGENTE_YA_EXISTE = 'ENTREGABLES_ENTREGABLE_PROYECTO_GRADO_VIGENTE_YA_EXISTE';
const ASESOR_NO_ASIGNADO = 'ENTREGABLES_ASESOR_PROYECTO_GRADO_NO_ASIGNADO';
const ARCHIVO_NO_DISPONIBLE = 'ENTREGABLES_PAQUETE_ENTREGABLE_ARCHIVO_ARTEFACTO_NO_DISPONIBLE';
const CANCELACION_NO_PERMITIDA = 'ENTREGABLES_ENTREGABLE_PROYECTO_GRADO_CANCELACION_NO_PERMITIDA';
const CIERRE_NO_PERMITIDO = 'ENTREGABLES_ENTREGABLE_PROYECTO_GRADO_CIERRE_NO_PERMITIDO';
const HABILITACION_NO_PERMITIDA =
  'ENTREGABLES_ENTREGABLE_PROYECTO_GRADO_DISPONIBILIDAD_EVALUACION_NO_PERMITIDA';
const ESTADO_TERMINAL = 'ENTREGABLES_ENTREGABLE_PROYECTO_GRADO_ESTADO_TERMINAL';
const PAQUETE_NO_DISPONIBLE = 'ENTREGABLES_PAQUETE_ENTREGABLE_NO_DISPONIBLE';
const PAQUETE_CANCELADO = 'ENTREGABLES_PAQUETE_ENTREGABLE_CANCELADO';
const PAQUETE_PROYECTO_CANCELADO = 'ENTREGABLES_PAQUETE_ENTREGABLE_PROYECTO_CANCELADO';
const PAQUETE_ACCESO_DENEGADO = 'ENTREGABLES_PAQUETE_ENTREGABLE_ACCESO_DENEGADO';

export const MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE =
  'No hay artefactos con revisión cerrada para empaquetar';

const MENSAJE_ASESOR_NO_ASIGNADO = 'Ya no eres el asesor vigente de este proyecto.';

type TablaDeMensajes = [string, string][];

function resolverMensaje(err: unknown, tabla: TablaDeMensajes): string {
  const coincidencia = tabla.find(([codigo]) => hasApiErrorCode(err, codigo));
  return coincidencia ? coincidencia[1] : getApiErrorMessage(err, 'Inténtalo nuevamente.');
}

const MENSAJES_GENERAR: TablaDeMensajes = [
  [SIN_ARTEFACTOS_PARA_PAQUETE, `${MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE}.`],
  [
    PAQUETE_DESACTUALIZADO,
    'Los artefactos del proyecto cambiaron mientras se armaba el paquete. Revisa la vista previa e inténtalo de nuevo.',
  ],
  [
    VIGENTE_YA_EXISTE,
    'Este proyecto ya tiene un entregable vigente. Cancélalo desde la lista de entregables para generar uno nuevo.',
  ],
  [ASESOR_NO_ASIGNADO, MENSAJE_ASESOR_NO_ASIGNADO],
  [
    ARCHIVO_NO_DISPONIBLE,
    'Un archivo del proyecto no está disponible por ahora. Inténtalo de nuevo en unos minutos.',
  ],
];

const MENSAJES_CAMBIAR_ESTADO: TablaDeMensajes = [
  [ASESOR_NO_ASIGNADO, MENSAJE_ASESOR_NO_ASIGNADO],
  [
    CANCELACION_NO_PERMITIDA,
    'Un entregable disponible para evaluación o en evaluación no se puede cancelar.',
  ],
  [CIERRE_NO_PERMITIDO, MOTIVO_NO_CERRABLE],
  [HABILITACION_NO_PERMITIDA, 'Solo un entregable Nuevo se puede habilitar para evaluación.'],
  [ESTADO_TERMINAL, 'El entregable ya está cancelado o cerrado y no admite más cambios.'],
];

const MENSAJES_DESCARGAR: TablaDeMensajes = [
  [PAQUETE_NO_DISPONIBLE, 'El paquete de este entregable no está disponible.'],
  [PAQUETE_CANCELADO, 'El entregable está cancelado: su paquete ya no se puede descargar.'],
  [PAQUETE_PROYECTO_CANCELADO, 'El proyecto está cancelado: no se puede descargar el paquete.'],
  [PAQUETE_ACCESO_DENEGADO, 'No tienes acceso al paquete de este entregable.'],
];

const MENSAJES_CONSULTA: TablaDeMensajes = [[ASESOR_NO_ASIGNADO, MENSAJE_ASESOR_NO_ASIGNADO]];

export function mensajeErrorGenerarEntregable(err: unknown): string {
  return resolverMensaje(err, MENSAJES_GENERAR);
}

export function mensajeErrorCambiarEstadoEntregable(err: unknown): string {
  return resolverMensaje(err, MENSAJES_CAMBIAR_ESTADO);
}

export function mensajeErrorDescargarPaquete(err: unknown): string {
  return resolverMensaje(err, MENSAJES_DESCARGAR);
}

export function mensajeErrorConsultaEntregable(err: unknown): string {
  return resolverMensaje(err, MENSAJES_CONSULTA);
}
