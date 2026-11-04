import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoEntregable } from '../models/OrdenCampoEntregable';
import { entregablesService } from '../services/entregablesService';
import { construirFiltros } from '../utils/filtros-entregable';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'proyectoGradoNombre:ASC',
  'proyectoGradoNombre:DESC',
  'versionEntregable:ASC',
  'versionEntregable:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'proyectoGradoNombre:ASC';

const DESEMPATE: Record<OrdenCampoEntregable, string> = {
  proyectoGradoNombre: 'versionEntregable:DESC',
  versionEntregable: 'proyectoGradoNombre:ASC',
};

export function useEntregablesAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEntregable;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoEntregable, nuevaDireccion: OrdenDireccion = 'ASC') {
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
    queryKey: ['entregables', 'asesor', page, texto.trim(), estadoIds, ordenCampo, ordenDireccion],
    queryFn: () =>
      entregablesService.consultarEntregablesAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`, DESEMPATE[ordenCampo]],
        filtros: construirFiltros(texto, estadoIds),
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
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
