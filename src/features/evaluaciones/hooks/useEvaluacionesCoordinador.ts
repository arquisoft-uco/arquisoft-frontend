import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { OrdenCampoEvaluacion } from '../models/OrdenCampoEvaluacion';
import { evaluacionesService } from '../services/evaluacionesService';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['proyecto:ASC', 'proyecto:DESC', 'estado:ASC', 'estado:DESC'] as const;

const ORDEN_POR_DEFECTO = 'proyecto:ASC';

export function construirFiltros(texto: string, estadoIds: string[]): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim();
  if (recortado) {
    nodos.push({
      tipo: 'PREDICADO',
      campo: 'proyecto',
      operador: 'CONTIENE',
      valor: recortado,
    });
  }
  if (estadoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estado',
      operador: 'IN',
      valores: estadoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function useEvaluacionesCoordinador() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEvaluacion;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoEvaluacion, nuevaDireccion: OrdenDireccion = 'ASC') {
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
      'evaluaciones',
      'coordinador',
      page,
      texto.trim(),
      estadoIds,
      ordenCampo,
      ordenDireccion,
    ],
    queryFn: () =>
      evaluacionesService.getEvaluacionesCoordinador({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
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
