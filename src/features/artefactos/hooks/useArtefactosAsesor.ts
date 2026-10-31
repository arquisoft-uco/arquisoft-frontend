import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import {
  construirFiltros,
  leerVersion,
  ordenamientoDe,
  ORDEN_POR_DEFECTO,
  ORDENES,
  type FiltrosArtefactosAsesor,
} from '../utils/filtros-artefactos-asesor';

const PAGE_SIZE = 10;

type DireccionOrden = 'ASC' | 'DESC';

export function useArtefactosAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const filtros: FiltrosArtefactosAsesor = {
    texto: parametros.texto('q').trim(),
    proyecto: parametros.texto('proyecto').trim(),
    documento: parametros.texto('documento').trim(),
    repositorio: parametros.texto('repositorio').trim(),
    version: leerVersion(parametros.texto('version')),
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

  function setVersion(valor: string) {
    parametros.cambiar({ version: valor || undefined });
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
      version: undefined,
    });
  }

  const query = useQuery({
    queryKey: [
      'artefactos',
      'asesor',
      'artefactos-asignados',
      page,
      filtros.texto,
      filtros.proyecto,
      filtros.documento,
      filtros.repositorio,
      filtros.version,
      orden,
    ],
    queryFn: () =>
      artefactosService.consultarArtefactosAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: ordenamientoDe(orden),
        filtros: construirFiltros(filtros),
      }),
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
    setVersion,
    orden,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
