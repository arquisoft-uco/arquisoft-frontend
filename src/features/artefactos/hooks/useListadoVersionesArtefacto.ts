import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { ArtefactoConNombre } from '../models/ArtefactoConNombre';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { buscarArtefactos } from '../utils/buscar-artefactos';
import { construirFiltros, leerFecha } from '../utils/filtros-versiones-artefacto';

export interface CatalogoArtefactos {
  artefactos: ArtefactoConNombre[];
  artefactoDe: (id: string) => ArtefactoConNombre | undefined;
  isLoading: boolean;
  isError: boolean;
}

interface Opciones {
  rol: 'asesor' | 'estudiante';
  catalogo: CatalogoArtefactos;
  consultar: (req: ConsultaCriteriaRequest) => Promise<Page<VersionArtefacto>>;
}

const PAGE_SIZE = 10;

const ORDENES = ['version:ASC', 'version:DESC', 'fechaCreacion:ASC', 'fechaCreacion:DESC'] as const;

const ORDEN_POR_DEFECTO = 'fechaCreacion:DESC';

const PAGINA_VACIA: Page<VersionArtefacto> = {
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

type DireccionOrden = 'ASC' | 'DESC';

export function useListadoVersionesArtefacto({ rol, catalogo, consultar }: Opciones) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const desde = leerFecha(parametros.texto('desde'));
  const hasta = leerFecha(parametros.texto('hasta'));
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = texto !== '' || desde !== '' || hasta !== '';

  const textoEfectivo = catalogo.isError ? '' : texto;
  const esperandoCatalogo = textoEfectivo !== '' && catalogo.isLoading;
  const ids = buscarArtefactos(catalogo.artefactos, textoEfectivo);
  const sinCoincidencias = !esperandoCatalogo && textoEfectivo.trim() !== '' && ids.length === 0;

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

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, desde: undefined, hasta: undefined });
  }

  const query = useQuery({
    queryKey: ['artefactos', 'versiones-artefacto', rol, page, ids, desde, hasta, orden],
    queryFn: () =>
      consultar({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltros({ artefactos: ids, desde, hasta }),
      }),
    placeholderData: keepPreviousData,
    enabled: !sinCoincidencias && !esperandoCatalogo,
  });

  return {
    ...query,
    data: sinCoincidencias ? PAGINA_VACIA : query.data,
    isLoading: query.isLoading || esperandoCatalogo,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    desde,
    hasta,
    setTexto,
    setDesde,
    setHasta,
    ordenCampo,
    ordenDireccion,
    setOrden,
    hayFiltros,
    limpiarFiltros,
    busquedaDisponible: !catalogo.isError,
  };
}

export type ListadoVersionesArtefacto = ReturnType<typeof useListadoVersionesArtefacto>;
