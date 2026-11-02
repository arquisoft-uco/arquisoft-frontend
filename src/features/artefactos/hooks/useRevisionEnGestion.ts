import type { VersionArtefacto } from '../models/VersionArtefacto';
import { textoAvisoObservaciones } from '../utils/aviso-observaciones';
import { ESTADO_OBSERVACION_SOLUCIONADA, situacionReapertura } from '../utils/decision-observacion';
import { revisionAdmiteDecisionObservacion } from '../utils/revision-version';
import { useObservacionesRevision } from './useObservacionesRevision';
import { usePuedeGestionarObservaciones } from './usePuedeGestionarObservaciones';
import { useUltimaVersionArtefacto } from './useUltimaVersionArtefacto';

interface Entrada {
  revisionAsesorId: string;
  version: VersionArtefacto;
}

export function useRevisionEnGestion({ revisionAsesorId, version }: Entrada) {
  const {
    data: observaciones,
    isLoading,
    isError,
    error,
    refetch,
  } = useObservacionesRevision(revisionAsesorId);
  const { puedeGestionar, omitidos } = usePuedeGestionarObservaciones();
  const omitido = omitidos?.has(version.artefacto) ?? false;
  const editable = puedeGestionar(version);
  const puedeDecidir =
    !editable && revisionAdmiteDecisionObservacion({ version, artefactoOmitido: omitido });
  const { ultimaVersion } = useUltimaVersionArtefacto(version.artefacto, puedeDecidir);
  const situacion = situacionReapertura({ version, ultimaVersion });
  const hayObservaciones = (observaciones?.length ?? 0) > 0;
  const textoAviso = textoAvisoObservaciones({
    editable,
    version,
    omitido,
    puedeDecidir,
    haySolucionadas:
      observaciones?.some((o) => o.estadoId === ESTADO_OBSERVACION_SOLUCIONADA) ?? false,
    situacion,
  });
  const mostrarNotaEnvio = editable && observaciones !== undefined && !hayObservaciones;

  return {
    observaciones,
    isLoading,
    isError,
    error,
    refetch,
    omitido,
    editable,
    puedeDecidir,
    situacion,
    textoAviso,
    hayObservaciones,
    mostrarNotaEnvio,
  };
}
