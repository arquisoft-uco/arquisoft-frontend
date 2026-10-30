import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { construirFiltros, leerFecha } from '../utils/filtros-versiones-artefacto';

interface Opciones {
  rol: 'asesor' | 'estudiante';
  consultar: (req: ConsultaCriteriaRequest) => Promise<Page<VersionArtefacto>>;
}

const PAGE_SIZE = 10;

const ORDENES = ['version:ASC', 'version:DESC', 'fechaCreacion:ASC', 'fechaCreacion:DESC'] as const;

const ORDEN_POR_DEFECTO = 'fechaCreacion:DESC';

type DireccionOrden = 'ASC' | 'DESC';

export function useListadoVersionesArtefacto({ rol, consultar }: Opciones) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const desde = leerFecha(parametros.texto('desde'));
  const hasta = leerFecha(parametros.texto('hasta'));
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];
  const hayFiltros = texto !== '' || desde !== '' || hasta !== '';

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
    queryKey: ['artefactos', 'versiones-artefacto', rol, page, texto.trim(), desde, hasta, orden],
    queryFn: () =>
      consultar({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
        filtros: construirFiltros({ texto, desde, hasta }),
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

export type ListadoVersionesArtefacto = ReturnType<typeof useListadoVersionesArtefacto>;
