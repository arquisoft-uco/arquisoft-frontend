import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { OrdenCampoFicha } from '../models/OrdenCampoFicha';
import { fichasPerfilService } from '../services/fichasPerfilService';

import { leerOrden, useParametrosListado } from './useParametrosListado';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'tituloProyecto:ASC',
  'tituloProyecto:DESC',
  'asesorNombre:ASC',
  'asesorNombre:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'tituloProyecto:ASC';

export function construirFiltroTitulo(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (!recortado) return undefined;
  return { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: recortado };
}

export function useFichasPerfilCoordinador() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoFicha;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoFicha, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: ['fichas-perfil', 'coordinador', page, texto.trim(), ordenCampo, ordenDireccion],
    queryFn: () =>
      fichasPerfilService.getFichasCoordinador({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
        filtros: construirFiltroTitulo(texto),
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
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
