import { useInfiniteQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import {
  construirFiltroDocumento,
  type DocumentoDeRepositorio,
} from '../utils/cambio-version-repositorio';

const TAMANIO_PAGINA = 100;

const ORDENAMIENTO = ['nombreRepositorio:ASC', 'nombreDocumento:ASC', 'numeroVersion:DESC'];

const CLAVE_BASE = ['artefactos', 'catalogos', 'versiones-repositorio'];

export function useVersionesRepositorioCatalogo(
  habilitado = true,
  documento?: DocumentoDeRepositorio,
) {
  const query = useInfiniteQuery({
    queryKey: documento
      ? [...CLAVE_BASE, documento.nombreRepositorio, documento.nombreDocumento]
      : CLAVE_BASE,
    enabled: habilitado,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      artefactosService.consultarVersionesRepositorioAsesor({
        pagina: pageParam,
        tamanio: TAMANIO_PAGINA,
        ordenamiento: ORDENAMIENTO,
        ...(documento && { filtros: construirFiltroDocumento(documento) }),
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
