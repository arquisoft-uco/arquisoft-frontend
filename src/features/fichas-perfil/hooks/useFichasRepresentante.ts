import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { FiltrosFichasRepresentante } from '../models/FiltrosFichasRepresentante';
import type { OrdenCampoFicha } from '../models/OrdenCampoFicha';

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

export function useFichasRepresentante() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtros: FiltrosFichasRepresentante = {
    titulo: parametros.texto('q'),
    asesorNombre: parametros.texto('asesor'),
    asesorEmail: parametros.texto('correo'),
    estadoIds: parametros.lista('estado'),
  };
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoFicha;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTitulo(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setAsesorNombre(valor: string) {
    parametros.cambiar({ asesor: valor });
  }

  function setAsesorEmail(valor: string) {
    parametros.cambiar({ correo: valor });
  }

  function toggleEstado(id: string) {
    const siguientes = filtros.estadoIds.includes(id)
      ? filtros.estadoIds.filter((e) => e !== id)
      : [...filtros.estadoIds, id];
    parametros.cambiar({ estado: siguientes });
  }

  function limpiarEstados() {
    parametros.cambiar({ estado: undefined });
  }

  function setOrden(nuevoCampo: OrdenCampoFicha, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({
      q: undefined,
      asesor: undefined,
      correo: undefined,
      estado: undefined,
    });
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
    goToPage: parametros.irAPagina,
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
