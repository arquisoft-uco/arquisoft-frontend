import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { fichasPerfilService } from '../services/fichasPerfilService';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

interface EstadoListado {
  page: number;
  texto: string;
  estadoId: string;
  ordenDireccion: OrdenDireccion;
}

const ESTADO_INICIAL: EstadoListado = { page: 0, texto: '', estadoId: '', ordenDireccion: 'ASC' };

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
  const [listado, setListado] = useState(ESTADO_INICIAL);
  const { page, texto, estadoId, ordenDireccion } = listado;

  function cambiar(cambio: Partial<EstadoListado>) {
    setListado((actual) => ({ ...actual, ...cambio, page: 0 }));
  }

  function goToPage(pagina: number) {
    setListado((actual) => ({ ...actual, page: pagina }));
  }

  function setTexto(valor: string) {
    cambiar({ texto: valor });
  }

  function setEstadoId(valor: string) {
    cambiar({ estadoId: valor });
  }

  function setOrden(direccion: OrdenDireccion) {
    cambiar({ ordenDireccion: direccion });
  }

  function limpiarFiltros() {
    cambiar({ texto: '', estadoId: '' });
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
    goToPage,
    texto,
    setTexto,
    estadoId,
    setEstadoId,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
