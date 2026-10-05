import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { FiltrosFichasRepresentante } from '../models/FiltrosFichasRepresentante';
import type { OrdenCampoFicha } from '../models/OrdenCampoFicha';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

interface EstadoListado {
  page: number;
  filtros: FiltrosFichasRepresentante;
  ordenCampo: OrdenCampoFicha;
  ordenDireccion: OrdenDireccion;
}

const FILTROS_VACIOS: FiltrosFichasRepresentante = {
  titulo: '',
  asesorNombre: '',
  asesorEmail: '',
  estadoIds: [],
};

const ESTADO_INICIAL: EstadoListado = {
  page: 0,
  filtros: FILTROS_VACIOS,
  ordenCampo: 'tituloProyecto',
  ordenDireccion: 'ASC',
};

export function useFichasRepresentante() {
  const [listado, setListado] = useState(ESTADO_INICIAL);
  const { page, filtros, ordenCampo, ordenDireccion } = listado;

  function cambiar(cambio: Partial<EstadoListado>) {
    setListado((actual) => ({ ...actual, ...cambio, page: 0 }));
  }

  function cambiarFiltros(cambio: Partial<FiltrosFichasRepresentante>) {
    setListado((actual) => ({
      ...actual,
      filtros: { ...actual.filtros, ...cambio },
      page: 0,
    }));
  }

  function goToPage(pagina: number) {
    setListado((actual) => ({ ...actual, page: pagina }));
  }

  function setTitulo(valor: string) {
    cambiarFiltros({ titulo: valor });
  }

  function setAsesorNombre(valor: string) {
    cambiarFiltros({ asesorNombre: valor });
  }

  function setAsesorEmail(valor: string) {
    cambiarFiltros({ asesorEmail: valor });
  }

  function toggleEstado(id: string) {
    setListado((actual) => ({
      ...actual,
      filtros: {
        ...actual.filtros,
        estadoIds: actual.filtros.estadoIds.includes(id)
          ? actual.filtros.estadoIds.filter((e) => e !== id)
          : [...actual.filtros.estadoIds, id],
      },
      page: 0,
    }));
  }

  function limpiarEstados() {
    cambiarFiltros({ estadoIds: [] });
  }

  function setOrden(campo: OrdenCampoFicha, direccion: OrdenDireccion = 'ASC') {
    cambiar({ ordenCampo: campo, ordenDireccion: direccion });
  }

  function limpiarFiltros() {
    cambiar({ filtros: FILTROS_VACIOS });
  }

  const filtrosRecortados = {
    titulo: filtros.titulo.trim(),
    asesorNombre: filtros.asesorNombre.trim(),
    asesorEmail: filtros.asesorEmail.trim(),
    estadoIds: filtros.estadoIds,
  };

  const query = useQuery({
    queryKey: [
      'fichas-perfil',
      'representante',
      filtrosRecortados,
      ordenCampo,
      ordenDireccion,
      page,
    ],
    queryFn: () =>
      fichasPerfilService.getFichasRepresentante(page, PAGE_SIZE, filtrosRecortados, [
        `${ordenCampo}:${ordenDireccion}`,
      ]),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage,
    filtros,
    setTitulo,
    setAsesorNombre,
    setAsesorEmail,
    toggleEstado,
    limpiarEstados,
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
