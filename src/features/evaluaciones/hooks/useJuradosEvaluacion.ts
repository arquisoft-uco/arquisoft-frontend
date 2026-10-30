import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { evaluacionesService } from '../services/evaluacionesService';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['jurado:ASC', 'jurado:DESC'] as const;

const ORDEN_POR_DEFECTO = 'jurado:ASC';

export function construirFiltrosJurado(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (!recortado) return undefined;
  return { tipo: 'PREDICADO', campo: 'jurado', operador: 'CONTIENE', valor: recortado };
}

export function useJuradosEvaluacion(evaluacionId: string) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const ordenDireccion = orden.split(':')[1] as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(direccion: OrdenDireccion) {
    const nuevo = `jurado:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: ['evaluaciones', evaluacionId, 'jurados', page, texto.trim(), ordenDireccion],
    queryFn: () =>
      evaluacionesService.getJuradosEvaluacion(evaluacionId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`jurado:${ordenDireccion}`],
        filtros: construirFiltrosJurado(texto),
      }),
    enabled: !!evaluacionId,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    setTexto,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}

export type ListadoJuradosEvaluacionData = ReturnType<typeof useJuradosEvaluacion>;
