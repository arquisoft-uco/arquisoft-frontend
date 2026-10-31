import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import {
  construirFiltros,
  ordenamientoDe,
  ORDEN_POR_DEFECTO,
  ORDENES,
} from '../utils/filtros-artefactos-asesor';

const PAGE_SIZE = 10;

type DireccionOrden = 'ASC' | 'DESC';

export function useArtefactosAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q').trim();
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = texto !== '';

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor || undefined });
  }

  function setOrden(campo: string, direccion: DireccionOrden) {
    const nuevo = `${campo}:${direccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: ['artefactos', 'asesor', 'artefactos-asignados', page, texto, orden],
    queryFn: () =>
      artefactosService.consultarArtefactosAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: ordenamientoDe(orden),
        filtros: construirFiltros(texto),
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
    orden,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
