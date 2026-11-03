import { useInfiniteQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useProyectosAsesorCatalogo(habilitado = true) {
  const query = useInfiniteQuery({
    queryKey: ['artefactos', 'catalogos', 'proyectos-asesor'],
    enabled: habilitado,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => artefactosService.consultarProyectosAsignables(pageParam),
    getNextPageParam: (ultima) => ultima.siguientePagina ?? undefined,
  });

  return {
    proyectos: query.data?.pages.flatMap((p) => p.proyectos) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hayMas: query.hasNextPage,
    cargandoMas: query.isFetchingNextPage,
    cargarMas: query.fetchNextPage,
  };
}
