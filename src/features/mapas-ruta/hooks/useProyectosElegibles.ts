import { useInfiniteQuery } from '@tanstack/react-query';
import { mapasRutaService } from '../services/mapasRutaService';

export function useProyectosElegibles() {
  const query = useInfiniteQuery({
    queryKey: ['mapas-ruta', 'proyectos-elegibles'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => mapasRutaService.consultarProyectosElegibles(pageParam),
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
