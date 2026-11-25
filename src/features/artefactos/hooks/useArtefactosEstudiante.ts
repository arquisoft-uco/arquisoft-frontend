import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { useFiltroEstadoRevision } from './useFiltroEstadoRevision';
import {
  construirFiltros,
  leerVersion,
  ordenamientoDe,
  ORDEN_POR_DEFECTO,
  ORDENES,
  type FiltrosArtefactosEstudiante,
} from '../utils/filtros-artefactos-estudiante';

const PAGE_SIZE = 10;

type DireccionOrden = 'ASC' | 'DESC';

export function useArtefactosEstudiante() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtro = useFiltroEstadoRevision(parametros.texto('estadoRevision').trim());
  const filtros: FiltrosArtefactosEstudiante = {
    texto: parametros.texto('q').trim(),
    proyecto: parametros.texto('proyecto').trim(),
    documento: parametros.texto('documento').trim(),
    repositorio: parametros.texto('repositorio').trim(),
    asesor: parametros.texto('asesor').trim(),
    version: leerVersion(parametros.texto('version')),
    estadoRevision: filtro.valor,
  };
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = Object.values(filtros).some((valor) => valor !== '');

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor || undefined });
  }

  function setProyecto(valor: string) {
    parametros.cambiar({ proyecto: valor || undefined });
  }

  function setDocumento(valor: string) {
    parametros.cambiar({ documento: valor || undefined });
  }

  function setRepositorio(valor: string) {
    parametros.cambiar({ repositorio: valor || undefined });
  }

  function setAsesor(valor: string) {
    parametros.cambiar({ asesor: valor || undefined });
  }

  function setVersion(valor: string) {
    parametros.cambiar({ version: valor || undefined });
  }

  function setEstadoRevision(valor: string) {
    parametros.cambiar({ estadoRevision: valor || undefined });
  }

  function setOrden(campo: string, direccion: DireccionOrden) {
    const nuevo = `${campo}:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({
      q: undefined,
      proyecto: undefined,
      documento: undefined,
      repositorio: undefined,
      asesor: undefined,
      version: undefined,
      estadoRevision: undefined,
    });
  }

  const query = useQuery({
    queryKey: [
      'artefactos',
      'estudiante',
      'mis-artefactos',
      page,
      filtros.texto,
      filtros.proyecto,
      filtros.documento,
      filtros.repositorio,
      filtros.asesor,
      filtros.version,
      orden,
      filtros.estadoRevision,
    ],
    queryFn: () =>
      artefactosService.consultarArtefactosEstudiante({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: ordenamientoDe(orden),
        // la UI y la key llevan el id del estado; el backend compara por nombre
        filtros: construirFiltros({ ...filtros, estadoRevision: filtro.consulta }),
      }),
    enabled: !filtro.esperandoCatalogo,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    filtros,
    setTexto,
    setProyecto,
    setDocumento,
    setRepositorio,
    setAsesor,
    setVersion,
    setEstadoRevision,
    estados: filtro.estados,
    orden,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
