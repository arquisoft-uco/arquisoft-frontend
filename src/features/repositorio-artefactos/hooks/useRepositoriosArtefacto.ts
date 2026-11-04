import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import { construirFiltros } from '../utils/filtros-repositorio';

const PAGE_SIZE = 10;

const ORDENES = [
  'nombreRepositorio:ASC',
  'nombreRepositorio:DESC',
  'descripcion:ASC',
  'descripcion:DESC',
  'administradorNombre:ASC',
  'administradorNombre:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'nombreRepositorio:ASC';

type DireccionOrden = 'ASC' | 'DESC';

export function useRepositoriosArtefacto() {
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
    queryKey: ['repositorio-artefactos', 'administrador', page, texto, orden],
    queryFn: () =>
      repositorioArtefactosService.consultarRepositoriosAdministrador({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [orden],
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
