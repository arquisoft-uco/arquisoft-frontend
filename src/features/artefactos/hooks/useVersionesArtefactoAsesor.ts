import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros, leerFecha } from '../utils/filtros-versiones-artefacto';

const PAGE_SIZE = 10;

const ORDENES = ['version:ASC', 'version:DESC', 'fechaCreacion:ASC', 'fechaCreacion:DESC'] as const;

const ORDEN_POR_DEFECTO = 'fechaCreacion:DESC';

type DireccionOrden = 'ASC' | 'DESC';

export function useVersionesArtefactoAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const artefacto = parametros.texto('artefacto');
  const desde = leerFecha(parametros.texto('desde'));
  const hasta = leerFecha(parametros.texto('hasta'));
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = artefacto !== '' || desde !== '' || hasta !== '';

  function setArtefacto(valor: string) {
    parametros.cambiar({ artefacto: valor || undefined });
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

  function limpiarFiltros() {
    parametros.cambiar({ artefacto: undefined, desde: undefined, hasta: undefined });
  }

  const query = useQuery({
    queryKey: ['artefactos', 'versiones-artefacto', 'asesor', page, artefacto, desde, hasta, orden],
    queryFn: () =>
      artefactosService.consultarVersionesArtefactoAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltros({ artefacto, desde, hasta }),
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    artefacto,
    desde,
    hasta,
    setArtefacto,
    setDesde,
    setHasta,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
  };
}
