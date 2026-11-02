import { useQueries } from '@tanstack/react-query';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';

export function useUltimasVersionesEstudiante(artefactoIds: string[], habilitado = true) {
  const idsUnicos = [...new Set(artefactoIds)];

  const consultas = useQueries({
    queries: idsUnicos.map((artefactoId) => ({
      queryKey: ['artefactos', 'versiones-artefacto', 'estudiante', 'ultima', artefactoId],
      enabled: habilitado,
      queryFn: () =>
        artefactosService
          .consultarVersionesArtefactoEstudiante({
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
          .then((pagina) => pagina.content[0] ?? null),
    })),
  });

  const porArtefacto = new Map(idsUnicos.map((id, i) => [id, consultas[i].data]));

  return {
    ultimaVersion: (artefactoId: string): VersionArtefacto | null | undefined =>
      porArtefacto.get(artefactoId),
    isLoading: consultas.some((c) => c.isLoading),
    isError: consultas.some((c) => c.isError),
  };
}
