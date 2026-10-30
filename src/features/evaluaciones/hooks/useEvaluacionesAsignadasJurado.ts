import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { evaluacionesService } from '../services/evaluacionesService';

const PAGE_SIZE = 10;

export function construirFiltrosAsignadas(
  texto: string,
  estadoJuradoIds: string[],
): NodoFiltroDTO | undefined {
  const nodos: NodoFiltroDTO[] = [];
  const recortado = texto.trim();
  if (recortado) {
    nodos.push({ tipo: 'PREDICADO', campo: 'proyecto', operador: 'CONTIENE', valor: recortado });
  }
  if (estadoJuradoIds.length > 0) {
    nodos.push({
      tipo: 'PREDICADO_MULTIVALOR',
      campo: 'estadoJurado',
      operador: 'IN',
      valores: estadoJuradoIds,
    });
  }
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function useEvaluacionesAsignadasJurado() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoJuradoIds = parametros.lista('estadoJurado');

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function toggleEstadoJurado(id: string) {
    const siguientes = estadoJuradoIds.includes(id)
      ? estadoJuradoIds.filter((e) => e !== id)
      : [...estadoJuradoIds, id];
    parametros.cambiar({ estadoJurado: siguientes });
  }

  function limpiarEstadosJurado() {
    parametros.cambiar({ estadoJurado: undefined });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, estadoJurado: undefined });
  }

  const query = useQuery({
    queryKey: ['evaluaciones', 'jurado', 'asignadas', page, texto.trim(), estadoJuradoIds],
    queryFn: () =>
      evaluacionesService.getEvaluacionesAsignadasJurado({
        pagina: page,
        tamanio: PAGE_SIZE,
        filtros: construirFiltrosAsignadas(texto, estadoJuradoIds),
      }),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    setTexto,
    estadoJuradoIds,
    toggleEstadoJurado,
    limpiarEstadosJurado,
    limpiarFiltros,
  };
}

export type ListadoEvaluacionesAsignadasJurado = ReturnType<typeof useEvaluacionesAsignadasJurado>;
