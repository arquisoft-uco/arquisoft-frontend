import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-revision-asesor';

const PAGE_SIZE = 10;

const ORDENES = ['estadoRevisionAsesor:ASC', 'estadoRevisionAsesor:DESC'] as const;

const ORDEN_POR_DEFECTO = 'estadoRevisionAsesor:ASC';

type DireccionOrden = 'ASC' | 'DESC';

export function useRevisionesRealizadasAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const direccionOrden = orden.split(':')[1] as DireccionOrden;

  function toggleEstado(id: string) {
    const siguientes = estadoIds.includes(id)
      ? estadoIds.filter((e) => e !== id)
      : [...estadoIds, id];
    parametros.cambiar({ estado: siguientes });
  }

  function limpiarEstados() {
    parametros.cambiar({ estado: undefined });
  }

  function setDireccionOrden(direccion: DireccionOrden) {
    const nuevo = `estadoRevisionAsesor:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ estado: undefined });
  }

  const query = useQuery({
    queryKey: ['artefactos', 'revisiones-asesor', 'realizadas', page, estadoIds, orden],
    queryFn: () =>
      artefactosService.consultarRevisionesAsesor({
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
    direccionOrden,
    setDireccionOrden,
    limpiarFiltros,
  };
}
