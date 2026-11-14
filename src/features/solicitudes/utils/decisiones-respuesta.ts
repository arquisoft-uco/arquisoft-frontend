export const ESTADO_RESPUESTA_EN_REVISION = 'EN_REVISION';
export const ESTADO_RESPUESTA_APROBADA = 'APROBADA';
export const ESTADO_RESPUESTA_NO_APROBADA = 'NO_APROBADA';

export interface TextosDecision {
  etiquetaAccion: string;
  titulo: string;
  descripcion: (nombreDestinatario: string) => string;
  consecuencias: string[];
  labelConfirmar: string;
  tituloExito: string;
  mensajeExito: string;
}

const AVISO_DEFINITIVO = 'No podrás cambiar el estado ni eliminar la respuesta después.';

function construirTextosDecision(destinatario: string): Record<string, TextosDecision> {
  const avisoCorreo = `El ${destinatario} recibirá un aviso por correo.`;
  return {
    [ESTADO_RESPUESTA_APROBADA]: {
      etiquetaAccion: 'Aprobar respuesta',
      titulo: '¿Aprobar respuesta?',
      descripcion: (nombreDestinatario) => `Vas a aprobar tu respuesta a ${nombreDestinatario}.`,
      consecuencias: [
        `El ${destinatario} verá la respuesta como aprobada.`,
        avisoCorreo,
        AVISO_DEFINITIVO,
      ],
      labelConfirmar: 'Aprobar',
      tituloExito: 'Respuesta aprobada',
      mensajeExito: `El ${destinatario} verá la respuesta como aprobada.`,
    },
    [ESTADO_RESPUESTA_NO_APROBADA]: {
      etiquetaAccion: 'Marcar como no aprobada',
      titulo: '¿Marcar como no aprobada?',
      descripcion: (nombreDestinatario) =>
        `Vas a marcar como no aprobada tu respuesta a ${nombreDestinatario}.`,
      consecuencias: [
        `El ${destinatario} verá la respuesta como no aprobada.`,
        avisoCorreo,
        AVISO_DEFINITIVO,
      ],
      labelConfirmar: 'Marcar como no aprobada',
      tituloExito: 'Respuesta marcada como no aprobada',
      mensajeExito: `El ${destinatario} verá la respuesta como no aprobada.`,
    },
  };
}

export const TEXTOS_DECISION: Record<string, TextosDecision> =
  construirTextosDecision('estudiante');
export const TEXTOS_DECISION_COORDINADOR: Record<string, TextosDecision> =
  construirTextosDecision('coordinador');
