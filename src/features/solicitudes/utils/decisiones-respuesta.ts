export const ESTADO_RESPUESTA_APROBADA = 'APROBADA';
export const ESTADO_RESPUESTA_NO_APROBADA = 'NO_APROBADA';

export interface TextosDecision {
  etiquetaAccion: string;
  titulo: string;
  descripcion: (nombreEstudiante: string) => string;
  consecuencias: string[];
  labelConfirmar: string;
  tituloExito: string;
  mensajeExito: string;
}

const AVISO_CORREO = 'El estudiante recibirá un aviso por correo.';
const AVISO_DEFINITIVO = 'No podrás cambiar el estado ni eliminar la respuesta después.';

export const TEXTOS_DECISION: Record<string, TextosDecision> = {
  [ESTADO_RESPUESTA_APROBADA]: {
    etiquetaAccion: 'Aprobar respuesta',
    titulo: '¿Aprobar respuesta?',
    descripcion: (nombreEstudiante) => `Vas a aprobar tu respuesta a ${nombreEstudiante}.`,
    consecuencias: [
      'El estudiante verá la respuesta como aprobada.',
      AVISO_CORREO,
      AVISO_DEFINITIVO,
    ],
    labelConfirmar: 'Aprobar',
    tituloExito: 'Respuesta aprobada',
    mensajeExito: 'El estudiante verá la respuesta como aprobada.',
  },
  [ESTADO_RESPUESTA_NO_APROBADA]: {
    etiquetaAccion: 'Marcar como no aprobada',
    titulo: '¿Marcar como no aprobada?',
    descripcion: (nombreEstudiante) =>
      `Vas a marcar como no aprobada tu respuesta a ${nombreEstudiante}.`,
    consecuencias: [
      'El estudiante verá la respuesta como no aprobada.',
      AVISO_CORREO,
      AVISO_DEFINITIVO,
    ],
    labelConfirmar: 'Marcar como no aprobada',
    tituloExito: 'Respuesta marcada como no aprobada',
    mensajeExito: 'El estudiante verá la respuesta como no aprobada.',
  },
};
