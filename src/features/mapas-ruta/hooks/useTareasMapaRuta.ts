import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoTarea } from '../models/OrdenCampoTarea';
import { mapasRutaService } from '../services/mapasRutaService';
import { construirFiltrosTarea } from '../utils/filtros-tarea';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['descripcion:ASC', 'descripcion:DESC'] as const;

const ORDEN_POR_DEFECTO = 'descripcion:ASC';

const ORDEN_CAMPO: OrdenCampoTarea = 'descripcion';

export function useTareasMapaRuta(mapaRutaId: string) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const ordenDireccion = orden.split(':')[1] as OrdenDireccion;
  const hayFiltros = texto.trim() !== '' || estadoIds.length > 0;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoTarea, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
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
    parametros.cambiar({ q: undefined, estado: undefined });
  }

  const query = useQuery({
    queryKey: [
      'mapas-ruta',
      'estudiante',
      mapaRutaId,
      'tareas',
      page,
      texto.trim(),
      estadoIds,
      ordenDireccion,
    ],
    queryFn: () =>
      mapasRutaService.consultarTareasMapaRuta(mapaRutaId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ORDEN_CAMPO}:${ordenDireccion}`],
        filtros: construirFiltrosTarea(texto, estadoIds),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    setTexto,
    estadoIds,
    toggleEstado,
    limpiarEstados,
    ordenCampo: ORDEN_CAMPO,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}

export type ListadoTareas = ReturnType<typeof useTareasMapaRuta>;
