import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';

export function useUltimaVersionArtefacto(artefactoId: string, habilitado: boolean) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['artefactos', 'versiones-artefacto', 'ultima-version', artefactoId],
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
        .then((pagina) => pagina.content[0] ?? null),
  });

  return { ultimaVersion: data, isLoading, isError, refetch };
}
