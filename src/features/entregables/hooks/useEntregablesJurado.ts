import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { OrdenCampoEntregableJurado } from '../models/OrdenCampoEntregableJurado';
import { entregablesService } from '../services/entregablesService';
import { construirFiltros } from '../utils/filtros-entregable';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'proyectoGradoNombre:ASC',
  'proyectoGradoNombre:DESC',
  'asesorNombre:ASC',
  'asesorNombre:DESC',
  'versionEntregable:ASC',
  'versionEntregable:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'proyectoGradoNombre:ASC';

const DESEMPATES: Record<OrdenCampoEntregableJurado, string[]> = {
  proyectoGradoNombre: ['versionEntregable:DESC'],
  asesorNombre: ['proyectoGradoNombre:ASC', 'versionEntregable:DESC'],
  versionEntregable: ['proyectoGradoNombre:ASC'],
};

export function useEntregablesJurado() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const asesor = parametros.texto('asesor');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEntregableJurado;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setAsesor(valor: string) {
    parametros.cambiar({ asesor: valor });
  }

  function setOrden(
    nuevoCampo: OrdenCampoEntregableJurado,
    nuevaDireccion: OrdenDireccion = 'ASC',
  ) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, asesor: undefined });
  }

  const query = useQuery({
    queryKey: [
      'entregables',
      'jurado',
      page,
      texto.trim(),
      asesor.trim(),
      ordenCampo,
      ordenDireccion,
    ],
    queryFn: () =>
      entregablesService.consultarEntregablesJurado({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`, ...DESEMPATES[ordenCampo]],
        filtros: construirFiltros(texto, [], asesor),
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
    asesor,
    setAsesor,
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
