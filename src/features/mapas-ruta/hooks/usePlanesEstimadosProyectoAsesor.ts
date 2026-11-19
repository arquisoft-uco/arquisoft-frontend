import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoPlanEstimadoProyecto } from '../models/OrdenCampoPlanEstimadoProyecto';
import { mapasRutaService } from '../services/mapasRutaService';
import { construirFiltrosPlanEstimadoProyecto } from '../utils/filtros-plan-estimado-proyecto';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'tiempoEstimadoDias:ASC',
  'tiempoEstimadoDias:DESC',
  'descripcionEstimado:ASC',
  'descripcionEstimado:DESC',
  'descripcionTarea:ASC',
  'descripcionTarea:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'tiempoEstimadoDias:ASC';

export function planesEstimadosProyectoAsesorQueryKey(proyectoGradoId: string) {
  return ['mapas-ruta', 'asesor', 'proyecto', proyectoGradoId, 'planes-estimados'] as const;
}

export function usePlanesEstimadosProyectoAsesor(proyectoGradoId: string) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [
    OrdenCampoPlanEstimadoProyecto,
    OrdenDireccion,
  ];
  const hayFiltros = texto.trim() !== '';

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(
    nuevoCampo: OrdenCampoPlanEstimadoProyecto,
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
      ...planesEstimadosProyectoAsesorQueryKey(proyectoGradoId),
      page,
      texto.trim(),
      orden,
    ],
    queryFn: () =>
      mapasRutaService.consultarPlanesEstimadosProyectoAsesor(proyectoGradoId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltrosPlanEstimadoProyecto(texto),
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
