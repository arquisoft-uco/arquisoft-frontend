import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { construirFiltrosRevisiones } from '../utils/filtros-revisiones-estudiante';
import { leerFecha } from '../utils/filtros-versiones-artefacto';
import { ESTADO_REVISION_PENDIENTE } from '../utils/revision-version';
import { useEstadosRevisionAsesor } from './useEstadosRevisionAsesor';

export const CLAVE_REVISIONES_ESTUDIANTE = [
  'artefactos',
  'revisiones-asesor',
  'estudiante',
] as const;

const PAGE_SIZE = 10;

const ORDENES = [
  'fechaCreacion:ASC',
  'fechaCreacion:DESC',
  'version:ASC',
  'version:DESC',
  'estadoRevisionAsesor:ASC',
  'estadoRevisionAsesor:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'fechaCreacion:DESC';

type DireccionOrden = 'ASC' | 'DESC';

export function useRevisionesEstudiante() {
  const parametros = useParametrosListado();
  const estados = useEstadosRevisionAsesor();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const desde = leerFecha(parametros.texto('desde'));
  const hasta = leerFecha(parametros.texto('hasta'));
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = texto !== '' || desde !== '' || hasta !== '' || estadoIds.length > 0;

  const opcionesEstado = estados.data
    ?.filter((estado) => estado.id !== ESTADO_REVISION_PENDIENTE)
    .map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor || undefined });
  }

  function setDesde(valor: string) {
    parametros.cambiar({ desde: valor || undefined });
  }

  function setHasta(valor: string) {
    parametros.cambiar({ hasta: valor || undefined });
  }

  function setOrden(campo: string, direccion: DireccionOrden) {
    const nuevo = `${campo}:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function toggleEstado(id: string) {
    const siguientes = estadoIds.includes(id)
      ? estadoIds.filter((estado) => estado !== id)
      : [...estadoIds, id];
    parametros.cambiar({ estado: siguientes });
  }

  function limpiarEstados() {
    parametros.cambiar({ estado: undefined });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, desde: undefined, hasta: undefined, estado: undefined });
  }

  const query = useQuery({
    queryKey: [...CLAVE_REVISIONES_ESTUDIANTE, page, texto.trim(), desde, hasta, orden, estadoIds],
    queryFn: () =>
      artefactosService.consultarRevisionesEstudiante({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltrosRevisiones({ texto, desde, hasta, estadoIds }),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    desde,
    hasta,
    estadoIds,
    opcionesEstado,
    toggleEstado,
    limpiarEstados,
    setTexto,
    setDesde,
    setHasta,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}

export type ListadoRevisionesEstudiante = ReturnType<typeof useRevisionesEstudiante>;
