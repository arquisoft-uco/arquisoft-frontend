import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoPlanRealProyecto } from '../models/OrdenCampoPlanRealProyecto';
import { mapasRutaService } from '../services/mapasRutaService';
import { construirFiltrosPlanRealProyecto } from '../utils/filtros-plan-real';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'tiempoRealDias:ASC',
  'tiempoRealDias:DESC',
  'descripcionTarea:ASC',
  'descripcionTarea:DESC',
  'descripcionReal:ASC',
  'descripcionReal:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'tiempoRealDias:ASC';

export function usePlanesRealesProyectoAsesor(proyectoGradoId: string) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [
    OrdenCampoPlanRealProyecto,
    OrdenDireccion,
  ];
  const hayFiltros = texto.trim() !== '';

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(
    nuevoCampo: OrdenCampoPlanRealProyecto,
    nuevaDireccion: OrdenDireccion = 'ASC',
  ) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: [
      'mapas-ruta',
      'asesor',
      'proyecto',
      proyectoGradoId,
      'planes-reales',
      page,
      texto.trim(),
      orden,
    ],
    queryFn: () =>
      mapasRutaService.consultarPlanesRealesProyectoAsesor(proyectoGradoId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltrosPlanRealProyecto(texto),
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
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
    hayFiltros,
  };
}
