import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoEntregableEstudiante } from '../models/OrdenCampoEntregableEstudiante';
import { entregablesService } from '../services/entregablesService';
import { leerEstadoProyecto } from '../utils/estado-proyecto';
import { construirFiltros } from '../utils/filtros-entregable';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'versionEntregable:DESC',
  'versionEntregable:ASC',
  'asesorNombre:ASC',
  'asesorNombre:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'versionEntregable:DESC';

const DESEMPATE: Record<OrdenCampoEntregableEstudiante, string> = {
  versionEntregable: 'asesorNombre:ASC',
  asesorNombre: 'versionEntregable:DESC',
};

export function useEntregablesEstudiante(proyectoGradoId: string) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const estadoProyecto = leerEstadoProyecto(parametros.texto('estadoProyecto'));
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEntregableEstudiante;
  const ordenDireccion = direccion as OrdenDireccion;

  function setEstadoProyecto(valor: string) {
    parametros.cambiar({ estadoProyecto: valor === 'finalizados' ? valor : undefined });
  }

  function setOrden(
    nuevoCampo: OrdenCampoEntregableEstudiante,
    nuevaDireccion: OrdenDireccion = 'ASC',
  ) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  const query = useQuery({
    queryKey: [
      'entregables',
      'estudiante',
      proyectoGradoId,
      page,
      ordenCampo,
      ordenDireccion,
      estadoProyecto,
    ],
    queryFn: () =>
      entregablesService.consultarEntregablesEstudiante(proyectoGradoId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`, DESEMPATE[ordenCampo]],
        filtros: construirFiltros('', [], '', estadoProyecto),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    ordenCampo,
    ordenDireccion,
    estadoProyecto,
    setEstadoProyecto,
    setOrden,
  };
}
