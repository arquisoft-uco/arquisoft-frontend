import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoMapaRuta } from '../models/OrdenCampoMapaRuta';
import { mapasRutaService } from '../services/mapasRutaService';
import {
  construirFiltros,
  construirOrden,
  leerFechaIso,
  type FechasFiltro,
} from '../utils/filtros-mapa-ruta';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['fechaInicio:DESC', 'fechaInicio:ASC', 'fechaFin:ASC', 'fechaFin:DESC'] as const;

const ORDEN_POR_DEFECTO = 'fechaInicio:DESC';

export function useMapasRutaCoordinador() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const fechas: FechasFiltro = {
    inicioDesde: leerFechaIso(parametros.texto('inicioDesde')),
    inicioHasta: leerFechaIso(parametros.texto('inicioHasta')),
    finDesde: leerFechaIso(parametros.texto('finDesde')),
    finHasta: leerFechaIso(parametros.texto('finHasta')),
  };
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoMapaRuta;
  const ordenDireccion = direccion as OrdenDireccion;

  const hayFiltros = Object.values(fechas).some((valor) => valor !== '');

  function setFecha(clave: keyof FechasFiltro, valor: string) {
    parametros.cambiar({ [clave]: valor || undefined });
  }

  function setOrden(nuevoCampo: OrdenCampoMapaRuta, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({
      inicioDesde: undefined,
      inicioHasta: undefined,
      finDesde: undefined,
      finHasta: undefined,
    });
  }

  const query = useQuery({
    queryKey: [
      'mapas-ruta',
      'coordinador',
      page,
      fechas.inicioDesde,
      fechas.inicioHasta,
      fechas.finDesde,
      fechas.finHasta,
      ordenCampo,
      ordenDireccion,
    ],
    queryFn: () =>
      mapasRutaService.consultarMapasRutaCoordinador({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: construirOrden(ordenCampo, ordenDireccion),
        filtros: construirFiltros(fechas),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    fechas,
    setFecha,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
