import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { OrdenCampoFicha } from '../models/OrdenCampoFicha';
import { fichasPerfilService } from '../services/fichasPerfilService';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

interface EstadoListado {
  page: number;
  texto: string;
  ordenCampo: OrdenCampoFicha;
  ordenDireccion: OrdenDireccion;
}

const ESTADO_INICIAL: EstadoListado = {
  page: 0,
  texto: '',
  ordenCampo: 'tituloProyecto',
  ordenDireccion: 'ASC',
};

export function construirFiltroTitulo(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (!recortado) return undefined;
  return { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: recortado };
}

export function useFichasPerfilCoordinador() {
  const [listado, setListado] = useState(ESTADO_INICIAL);
  const { page, texto, ordenCampo, ordenDireccion } = listado;

  function cambiar(cambio: Partial<EstadoListado>) {
    setListado((actual) => ({ ...actual, ...cambio, page: 0 }));
  }

  function goToPage(pagina: number) {
    setListado((actual) => ({ ...actual, page: pagina }));
  }

  function setTexto(valor: string) {
    cambiar({ texto: valor });
  }

  function setOrden(campo: OrdenCampoFicha, direccion: OrdenDireccion = 'ASC') {
    cambiar({ ordenCampo: campo, ordenDireccion: direccion });
  }

  function limpiarFiltros() {
    cambiar({ texto: '' });
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
    goToPage,
    texto,
    setTexto,
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
