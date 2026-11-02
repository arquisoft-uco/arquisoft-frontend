import { useInfiniteQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

const TAMANIO_PAGINA = 100;

const ORDENAMIENTO = ['nombreRepositorio:ASC', 'nombreDocumento:ASC', 'numeroVersion:DESC'];

export function useVersionesRepositorioCatalogo(habilitado = true) {
  const query = useInfiniteQuery({
    queryKey: ['artefactos', 'catalogos', 'versiones-repositorio'],
    enabled: habilitado,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      artefactosService.consultarVersionesRepositorioAsesor({
        pagina: pageParam,
        tamanio: TAMANIO_PAGINA,
        ordenamiento: ORDENAMIENTO,
      }),
    getNextPageParam: (ultima) => (ultima.last ? undefined : ultima.page + 1),
  });

  return {
    versiones: query.data?.pages.flatMap((p) => p.content) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hayMas: query.hasNextPage,
    cargandoMas: query.isFetchingNextPage,
    cargarMas: query.fetchNextPage,
  };
}
