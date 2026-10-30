import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoEntregableEstudiante } from '../models/OrdenCampoEntregableEstudiante';
import { entregablesService } from '../services/entregablesService';

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
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEntregableEstudiante;
  const ordenDireccion = direccion as OrdenDireccion;

  function setOrden(
    nuevoCampo: OrdenCampoEntregableEstudiante,
    nuevaDireccion: OrdenDireccion = 'ASC',
  ) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  const query = useQuery({
    queryKey: ['entregables', 'estudiante', proyectoGradoId, page, ordenCampo, ordenDireccion],
    queryFn: () =>
      entregablesService.consultarEntregablesEstudiante(proyectoGradoId, {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`, DESEMPATE[ordenCampo]],
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
    setOrden,
  };
}
