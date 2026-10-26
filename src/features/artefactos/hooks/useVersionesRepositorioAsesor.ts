import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-repositorio';

const PAGE_SIZE = 10;

const ORDENES = [
  'nombreDocumento:ASC',
  'nombreDocumento:DESC',
  'numeroVersion:ASC',
  'numeroVersion:DESC',
  'fechaCreacion:ASC',
  'fechaCreacion:DESC',
  'nombreRepositorio:ASC',
  'nombreRepositorio:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'nombreDocumento:ASC';

const ORDENAMIENTO_POR_DEFECTO = ['nombreDocumento:ASC', 'numeroVersion:DESC'];

type DireccionOrden = 'ASC' | 'DESC';

export function useVersionesRepositorioAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [ordenCampo, ordenDireccion] = orden.split(':') as [string, DireccionOrden];

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
    queryKey: ['artefactos', 'versiones-repositorio', 'asesor', page, texto, orden],
    queryFn: () =>
      artefactosService.consultarVersionesRepositorioAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: orden === ORDEN_POR_DEFECTO ? ORDENAMIENTO_POR_DEFECTO : [orden],
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
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
