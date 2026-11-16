import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { bibliotecaService } from '../services/bibliotecaService';
import { construirFiltros } from '../utils/filtros-documentacion';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['fechaPublicacion:DESC', 'fechaPublicacion:ASC'] as const;

const ORDEN_POR_DEFECTO = 'fechaPublicacion:DESC';

export function useDocumentaciones(filtraPorEstado: boolean) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const estadoIds = filtraPorEstado ? parametros.lista('estado') : [];
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const ordenDireccion = orden.split(':')[1] as OrdenDireccion;

  function setOrden(direccion: OrdenDireccion) {
    const nuevo = `fechaPublicacion:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function toggleEstado(id: string) {
    const siguientes = estadoIds.includes(id)
      ? estadoIds.filter((e) => e !== id)
      : [...estadoIds, id];
    parametros.cambiar({ estado: siguientes });
  }

  function limpiarEstados() {
    parametros.cambiar({ estado: undefined });
  }

  function limpiarFiltros() {
    limpiarEstados();
  }

  const query = useQuery({
    queryKey: ['biblioteca', 'documentaciones', page, estadoIds, ordenDireccion],
    queryFn: () =>
      bibliotecaService.consultarDocumentaciones({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltros(estadoIds),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    estadoIds,
    toggleEstado,
    limpiarEstados,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
