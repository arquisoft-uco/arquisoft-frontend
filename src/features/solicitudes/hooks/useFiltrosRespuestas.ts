import { useState } from 'react';
import type {
  OrdenCampoRespuesta,
  OrdenDireccionRespuesta,
  ParametrosRespuestas,
} from '../models/ParametrosRespuestas';
import { ORDEN_POR_DEFECTO } from '../utils/criterio-respuestas';

const PARAMETROS_INICIALES: ParametrosRespuestas = {
  page: 0,
  texto: '',
  estadoIds: [],
  ordenCampo: ORDEN_POR_DEFECTO.campo,
  ordenDireccion: ORDEN_POR_DEFECTO.direccion,
};

export function useFiltrosRespuestas() {
  const [parametros, setParametros] = useState<ParametrosRespuestas>(PARAMETROS_INICIALES);

  function goToPage(page: number) {
    setParametros((actual) => ({ ...actual, page }));
  }

  function setTexto(texto: string) {
    setParametros((actual) => ({ ...actual, texto, page: 0 }));
  }

  function toggleEstado(id: string) {
    setParametros((actual) => ({
      ...actual,
      estadoIds: actual.estadoIds.includes(id)
        ? actual.estadoIds.filter((e) => e !== id)
        : [...actual.estadoIds, id],
      page: 0,
    }));
  }

  function limpiarEstados() {
    setParametros((actual) => ({ ...actual, estadoIds: [], page: 0 }));
  }

  function setOrden(ordenCampo: OrdenCampoRespuesta, ordenDireccion: OrdenDireccionRespuesta) {
    setParametros((actual) => ({ ...actual, ordenCampo, ordenDireccion, page: 0 }));
  }

  function limpiarFiltros() {
    setParametros((actual) => ({ ...actual, texto: '', estadoIds: [], page: 0 }));
  }

  const hayFiltros = parametros.texto.trim() !== '' || parametros.estadoIds.length > 0;

  return {
    ...parametros,
    goToPage,
    setTexto,
    toggleEstado,
    limpiarEstados,
    setOrden,
    limpiarFiltros,
    hayFiltros,
  };
}

export type FiltrosRespuestas = ReturnType<typeof useFiltrosRespuestas>;
