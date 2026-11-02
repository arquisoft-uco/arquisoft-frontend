import type { RevisionGestionable } from '../models/RevisionGestionable';
import { contarObservacionesAbiertas } from '../utils/avance-observacion';
import { motivoBloqueoSubida } from '../utils/bloqueo-subida-version';
import { haySubidaPosterior } from '../utils/revision-gestionable';
import { ESTADO_REVISION_EN_PROGRESO } from '../utils/revision-resoluble';
import { ESTADO_REVISION_CERRADA, ESTADO_REVISION_RESUELTA } from '../utils/revision-version';
import { useObservacionesRevisionEstudiante } from './useObservacionesRevisionEstudiante';
import { useUltimasVersionesEstudiante } from './useUltimasVersionesEstudiante';

const NOTA_SOLO_LECTURA = 'Esta revisión ya no admite cambios.';
const NOTA_RESUELTA =
  'Marcaste esta revisión como resuelta. Esperando la siguiente revisión del asesor.';
const NOTA_CERRADA =
  'El asesor dio por completado este artefacto, por eso no admite nuevas versiones.';
const NOTA_SIN_SUBIDA =
  'Sube una nueva versión del artefacto antes de marcar la revisión como resuelta.';
const NOTA_LISTA = 'Todo listo: ya puedes marcar la revisión como resuelta.';

function notaFaltan(abiertas: number): string {
  return abiertas === 1
    ? 'Te falta marcar 1 observación como solucionada.'
    : `Te faltan ${abiertas} observaciones por marcar como solucionadas.`;
}

export function useGestionarRevisionEstudiante(revision: RevisionGestionable) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevisionEstudiante(
    revision.id,
  );
  const ultimas = useUltimasVersionesEstudiante([revision.artefactoId]);
  const ultima = ultimas.ultimaVersion(revision.artefactoId);

  const abiertas = contarObservacionesAbiertas(data ?? []);
  const editable = revision.estadoId === ESTADO_REVISION_EN_PROGRESO;
  const motivoSubida = ultima === undefined ? undefined : motivoBloqueoSubida(ultima);
  const puedeSubir = editable && motivoSubida === null;
  const puedeResolver = editable && !isLoading && !isError && abiertas === 0;
  const subidaPosterior = haySubidaPosterior(revision.version, ultima);

  function calcularNota(): string | undefined {
    if (revision.estadoId === ESTADO_REVISION_RESUELTA) return NOTA_RESUELTA;
    if (revision.estadoId === ESTADO_REVISION_CERRADA) return NOTA_CERRADA;
    if (!editable) return NOTA_SOLO_LECTURA;
    if (isLoading || isError) return undefined;
    if (abiertas > 0) return notaFaltan(abiertas);
    return subidaPosterior === false ? NOTA_SIN_SUBIDA : NOTA_LISTA;
  }

  return {
    observaciones: data,
    isLoading,
    isError,
    error,
    refetch,
    abiertas,
    editable,
    motivoSubida,
    puedeSubir,
    puedeResolver,
    notaPie: calcularNota(),
  };
}
