import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { FiltrosFichasDisponibles } from '../models/FiltrosFichasDisponibles';
import type { OrdenCampoFicha } from '../models/OrdenCampoFicha';

import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';

const PAGE_SIZE = 10;

export type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'tituloProyecto:ASC',
  'tituloProyecto:DESC',
  'asesorNombre:ASC',
  'asesorNombre:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'tituloProyecto:ASC';

export function useFichasDisponibles() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtros: FiltrosFichasDisponibles = {
    titulo: parametros.texto('q'),
    asesorNombre: parametros.texto('asesor'),
    asesorEmail: parametros.texto('correo'),
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

  function setOrden(nuevoCampo: OrdenCampoFicha, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({
      q: undefined,
      asesor: undefined,
      correo: undefined,
    });
  }

  const filtrosRecortados = {
    titulo: filtros.titulo.trim(),
    asesorNombre: filtros.asesorNombre.trim(),
    asesorEmail: filtros.asesorEmail.trim(),
  };

  const query = useQuery({
    queryKey: [
      'fichas-perfil',
      'representante',
      'disponibles',
      filtrosRecortados,
      ordenCampo,
      ordenDireccion,
      page,
    ],
    queryFn: () =>
      fichasPerfilService.getFichasDisponiblesEvaluacion(page, PAGE_SIZE, filtrosRecortados, [
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
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
