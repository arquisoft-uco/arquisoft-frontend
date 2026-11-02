import type { ObservacionRevision } from '../models/ObservacionRevision';
import type { VersionArtefacto } from '../models/VersionArtefacto';

export const TEXTO_CIERRE_CON_OBSERVACIONES =
  'Para dar por completado, elimina primero las observaciones de esta revisión.';
export const TEXTO_CIERRE_NO_VERIFICABLE =
  'No pudimos verificar las observaciones de la versión anterior. Inténtalo nuevamente.';

export function textoCierreAnteriorSinCerrar(sinCerrar: number): string {
  return `Para dar por completado, cierra primero las observaciones de la versión anterior (${sinCerrar} sin cerrar).`;
}

interface AnteriorCierre {
  versionAnterior: VersionArtefacto | null | undefined;
  observaciones: ObservacionRevision[] | undefined;
  isLoading: boolean;
  isError: boolean;
  sinCerrar: number;
}

interface EntradaCierre {
  version: VersionArtefacto;
  observaciones: ObservacionRevision[] | undefined;
  anterior: AnteriorCierre;
}

export interface EvaluacionCierre {
  puedeCerrar: boolean;
  motivo: string | null;
}

const DESCONOCIDO: EvaluacionCierre = { puedeCerrar: false, motivo: null };
const CUMPLE: EvaluacionCierre = { puedeCerrar: true, motivo: null };

export function evaluarCierre({
  version,
  observaciones,
  anterior,
}: EntradaCierre): EvaluacionCierre {
  if (observaciones === undefined) return DESCONOCIDO;
  if (observaciones.length > 0) {
    return { puedeCerrar: false, motivo: TEXTO_CIERRE_CON_OBSERVACIONES };
  }
  if (version.version === 1 || anterior.versionAnterior === null) return CUMPLE;
  if (anterior.isError) return { puedeCerrar: false, motivo: TEXTO_CIERRE_NO_VERIFICABLE };
  if (anterior.versionAnterior === undefined || anterior.isLoading) return DESCONOCIDO;
  if (anterior.versionAnterior.revisionAsesor === null) return CUMPLE;
  if (anterior.observaciones === undefined) return DESCONOCIDO;
  if (anterior.sinCerrar > 0) {
    return { puedeCerrar: false, motivo: textoCierreAnteriorSinCerrar(anterior.sinCerrar) };
  }
  return CUMPLE;
}
