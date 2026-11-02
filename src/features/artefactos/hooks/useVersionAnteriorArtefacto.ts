import { useQuery } from '@tanstack/react-query';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';

export function useVersionAnteriorArtefacto(version: VersionArtefacto) {
  const numeroAnterior = version.version - 1;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      'artefactos',
      'versiones-artefacto',
      'version-anterior',
      version.artefacto,
      numeroAnterior,
    ],
    enabled: version.version > 1,
    queryFn: () =>
      artefactosService
        .consultarVersionesArtefactoAsesor({
          pagina: 0,
          tamanio: 1,
          filtros: construirFiltros({
            texto: '',
            desde: '',
            hasta: '',
            estadoIds: [],
            artefacto: version.artefacto,
            version: numeroAnterior,
          }),
        })
        .then((pagina) => pagina.content[0] ?? null),
  });

  const versionAnterior: VersionArtefacto | null | undefined = version.version <= 1 ? null : data;

  return { versionAnterior, isLoading, isError, error, refetch };
}
