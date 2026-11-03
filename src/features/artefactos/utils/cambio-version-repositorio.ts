import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import type { VersionRepositorioAsesor } from '../models/VersionRepositorioAsesor';
import { ESTADO_REVISION_EN_PROGRESO } from './revision-resoluble';
import { ESTADO_REVISION_PENDIENTE } from './revision-version';

export interface DocumentoDeRepositorio {
  nombreRepositorio: string;
  nombreDocumento: string;
}

export const MOTIVO_SIN_REVISION =
  'La última versión aún no tiene revisión. El cambio se habilita cuando el asesor la registre.';
export const MOTIVO_REVISION_CERRADA =
  'La revisión de la última versión ya está resuelta o cerrada, por eso no se puede cambiar la versión del repositorio.';

export function puedeCambiarVersionRepositorio(ultimaVersion: VersionArtefacto | null): boolean {
  if (ultimaVersion === null) return true;
  return (
    ultimaVersion.estadoRevision === ESTADO_REVISION_PENDIENTE ||
    ultimaVersion.estadoRevision === ESTADO_REVISION_EN_PROGRESO
  );
}

export function motivoBloqueoCambioVersion(ultimaVersion: VersionArtefacto | null): string {
  if (ultimaVersion?.estadoRevision == null) return MOTIVO_SIN_REVISION;
  return MOTIVO_REVISION_CERRADA;
}

export function construirFiltroDocumento({
  nombreRepositorio,
  nombreDocumento,
}: DocumentoDeRepositorio): NodoFiltroDTO {
  return {
    tipo: 'GRUPO',
    conector: 'AND',
    nodos: [
      { tipo: 'PREDICADO', campo: 'nombreRepositorio', operador: 'ES', valor: nombreRepositorio },
      { tipo: 'PREDICADO', campo: 'nombreDocumento', operador: 'ES', valor: nombreDocumento },
    ],
  };
}

export function excluirVersionActual(
  versiones: VersionRepositorioAsesor[],
  versionActualId: string,
): VersionRepositorioAsesor[] {
  return versiones.filter((version) => version.id !== versionActualId);
}
