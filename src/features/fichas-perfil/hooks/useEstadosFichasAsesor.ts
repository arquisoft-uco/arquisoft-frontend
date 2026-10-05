import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { fichasPerfilService } from '../services/fichasPerfilService';

import { leerOrden, useParametrosListado } from './useParametrosListado';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['tituloProyecto:ASC', 'tituloProyecto:DESC'] as const;

const ORDEN_POR_DEFECTO = 'tituloProyecto:ASC';

export function construirFiltros(estadoId: string, titulo: string): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  if (estadoId) {
    nodos.push({ tipo: 'PREDICADO', campo: 'estadoFicha', operador: 'ES', valor: estadoId });
  }
  const tituloLimpio = titulo.trim();
  if (tituloLimpio) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'tituloProyecto',
      operador: 'CONTIENE',
      valor: tituloLimpio,
    });
  }

  if (nodos.length === 0) {
    return undefined;
  }
  if (nodos.length === 1) {
    return nodos[0];
  }
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function useEstadosFichasAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoId = parametros.texto('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const ordenDireccion = orden.split(':')[1] as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setEstadoId(valor: string) {
    parametros.cambiar({ estado: valor });
  }

  function setOrden(direccion: OrdenDireccion) {
    parametros.cambiar({ orden: direccion === 'ASC' ? undefined : `tituloProyecto:${direccion}` });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, estado: undefined });
  }

  const query = useQuery({
    queryKey: [
      'fichas-perfil',
      'estados-ficha-asesor',
      page,
      texto.trim(),
      estadoId,
      ordenDireccion,
    ],
    queryFn: () =>
      fichasPerfilService.getEstadosFichasAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`tituloProyecto:${ordenDireccion}`],
        filtros: construirFiltros(estadoId, texto),
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
    estadoId,
    setEstadoId,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
