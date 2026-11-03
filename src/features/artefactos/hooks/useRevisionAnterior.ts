import type { VersionArtefacto } from '../models/VersionArtefacto';
import {
  ESTADO_OBSERVACION_SOLUCIONADA,
  situacionReapertura,
  textoSituacionReapertura,
} from '../utils/decision-observacion';
import { contarSinCerrar } from '../utils/observaciones-revision-anterior';
import { revisionAdmiteDecisionObservacion } from '../utils/revision-version';
import { useObservacionesRevision } from './useObservacionesRevision';
import { useUltimaVersionArtefacto } from './useUltimaVersionArtefacto';
import { useVersionAnteriorArtefacto } from './useVersionAnteriorArtefacto';

interface Entrada {
  version: VersionArtefacto;
  omitido: boolean | undefined;
}

export function useRevisionAnterior({ version, omitido }: Entrada) {
  const versionQuery = useVersionAnteriorArtefacto(version);
  const { versionAnterior } = versionQuery;
  const observacionesQuery = useObservacionesRevision(versionAnterior?.revisionAsesor ?? null);
  const observaciones = observacionesQuery.data;

  const puedeDecidir =
    omitido === false &&
    !!versionAnterior &&
    revisionAdmiteDecisionObservacion({ version: versionAnterior, artefactoOmitido: false });
  const { ultimaVersion } = useUltimaVersionArtefacto(version.artefacto, puedeDecidir);
  const situacion = versionAnterior
    ? situacionReapertura({ version: versionAnterior, ultimaVersion })
    : 'cargando';

  const { total, sinCerrar } = contarSinCerrar(observaciones ?? []);
  const hayRevisionAnterior = !!versionAnterior && versionAnterior.revisionAsesor !== null;
  const visible =
    version.version > 1 &&
    (versionAnterior === undefined ||
      versionQuery.isError ||
      (hayRevisionAnterior &&
        (observacionesQuery.isLoading || observacionesQuery.isError || total > 0)));

  const haySolucionadas =
    observaciones?.some((o) => o.estadoId === ESTADO_OBSERVACION_SOLUCIONADA) ?? false;
  const textoAviso =
    puedeDecidir && haySolucionadas && versionAnterior
      ? textoSituacionReapertura(situacion, versionAnterior)
      : null;

  const falloVersion = versionQuery.isError;
  return {
    visible,
    versionAnterior,
    observaciones,
    isLoading:
      versionAnterior === undefined ? versionQuery.isLoading : observacionesQuery.isLoading,
    isError: falloVersion || observacionesQuery.isError,
    error: falloVersion ? versionQuery.error : observacionesQuery.error,
    refetch: () => (falloVersion ? versionQuery.refetch() : observacionesQuery.refetch()),
    total,
    sinCerrar,
    puedeDecidir,
    situacion,
    textoAviso,
  };
}

export type RevisionAnterior = ReturnType<typeof useRevisionAnterior>;
