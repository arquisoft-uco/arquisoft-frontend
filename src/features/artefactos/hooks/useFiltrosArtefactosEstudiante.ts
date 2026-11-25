import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import {
  construirFiltros,
  leerVersion,
  ordenamientoDe,
  ORDEN_POR_DEFECTO,
  ORDENES,
  type FiltrosArtefactosEstudiante,
} from '../utils/filtros-artefactos-estudiante';
import { useFiltroEstadosRevision } from './useFiltroEstadosRevision';

const PAGE_SIZE = 10;

type DireccionOrden = 'ASC' | 'DESC';

export function useFiltrosArtefactosEstudiante(
  ordenamiento: (orden: string) => string[] = ordenamientoDe,
) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtro = useFiltroEstadosRevision(parametros.lista('estadoRevision'));
  const filtros: FiltrosArtefactosEstudiante = {
    texto: parametros.texto('q').trim(),
    proyecto: parametros.texto('proyecto').trim(),
    documento: parametros.texto('documento').trim(),
    repositorio: parametros.texto('repositorio').trim(),
    asesor: parametros.texto('asesor').trim(),
    version: leerVersion(parametros.texto('version')),
    estadosRevision: filtro.ids,
  };
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const { estadosRevision, ...filtrosDeTexto } = filtros;
  const hayFiltros =
    estadosRevision.length > 0 || Object.values(filtrosDeTexto).some((valor) => valor !== '');

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

  function toggleEstadoRevision(id: string) {
    const siguientes = estadosRevision.includes(id)
      ? estadosRevision.filter((estado) => estado !== id)
      : [...estadosRevision, id];
    parametros.cambiar({ estadoRevision: siguientes });
  }

  function limpiarEstadosRevision() {
    parametros.cambiar({ estadoRevision: undefined });
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

  const claveFiltros = [
    page,
    filtros.texto,
    filtros.proyecto,
    filtros.documento,
    filtros.repositorio,
    filtros.asesor,
    filtros.version,
    orden,
    filtros.estadosRevision,
  ];

  const criterio: ConsultaCriteriaRequest = {
    pagina: page,
    tamanio: PAGE_SIZE,
    ordenamiento: ordenamiento(orden),
    // la UI y la key llevan el id del estado; el backend compara por nombre
    filtros: construirFiltros({ ...filtros, estadosRevision: filtro.consultas }),
  };

  return {
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
    toggleEstadoRevision,
    limpiarEstadosRevision,
    estados: filtro.estados,
    orden,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
    claveFiltros,
    criterio,
    habilitado: !filtro.esperandoCatalogo,
  };
}
