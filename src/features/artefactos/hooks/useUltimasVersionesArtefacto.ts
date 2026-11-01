import { useQueries } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';

export function useUltimasVersionesArtefacto(artefactoIds: string[], habilitado = true) {
  const idsUnicos = [...new Set(artefactoIds)];

  const consultas = useQueries({
    queries: idsUnicos.map((artefactoId) => ({
      queryKey: ['artefactos', 'versiones-artefacto', 'ultima', artefactoId],
      enabled: habilitado,
      queryFn: () =>
        artefactosService
          .consultarVersionesArtefactoAsesor({
            pagina: 0,
            tamanio: 1,
            ordenamiento: ['version:DESC'],
            filtros: construirFiltros({
              texto: '',
              desde: '',
              hasta: '',
              estadoIds: [],
              artefacto: artefactoId,
            }),
          })
          .then((pagina) => pagina.content[0]?.id ?? null),
    })),
  });

  const porArtefacto = new Map(idsUnicos.map((id, i) => [id, consultas[i].data]));

  return {
    ultimaVersionId: (artefactoId: string): string | null | undefined =>
      porArtefacto.get(artefactoId),
    isLoading: consultas.some((c) => c.isLoading),
    isError: consultas.some((c) => c.isError),
  };
}
