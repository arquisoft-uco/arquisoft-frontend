import { useQueries } from '@tanstack/react-query';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';

export function useUltimasVersionesArtefacto(artefactoIds: string[], habilitado = true) {
  const idsUnicos = [...new Set(artefactoIds)];

  const consultas = useQueries({
    queries: idsUnicos.map((artefactoId) => ({
      queryKey: ['artefactos', 'versiones-artefacto', 'ultimas-dos', artefactoId],
      enabled: habilitado,
      queryFn: () =>
        artefactosService
          .consultarVersionesArtefactoAsesor({
            pagina: 0,
            tamanio: 2,
            ordenamiento: ['version:DESC'],
            filtros: construirFiltros({
              texto: '',
              desde: '',
              hasta: '',
              estadoIds: [],
              artefacto: artefactoId,
            }),
          })
          .then((pagina) => pagina.content),
    })),
  });

  const porArtefacto = new Map(idsUnicos.map((id, i) => [id, consultas[i].data]));

  return {
    ultimaVersionId: (artefactoId: string): string | null | undefined => {
      const content = porArtefacto.get(artefactoId);
      return content === undefined ? undefined : (content[0]?.id ?? null);
    },
    versionAnterior: (artefactoId: string): VersionArtefacto | null | undefined => {
      const content = porArtefacto.get(artefactoId);
      return content === undefined ? undefined : (content[1] ?? null);
    },
    isLoading: consultas.some((c) => c.isLoading),
    isError: consultas.some((c) => c.isError),
  };
}
