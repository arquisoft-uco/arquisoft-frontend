import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import type { OrdenCampoEvaluacionAsesor } from '../models/EvaluacionFichaPerfilAsesor';
import { fichasPerfilService } from '../services/fichasPerfilService';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = [
  'fechaCreacion:DESC',
  'fechaCreacion:ASC',
  'tituloProyecto:ASC',
  'tituloProyecto:DESC',
] as const;

const ORDEN_POR_DEFECTO = 'fechaCreacion:DESC';

function construirFiltros(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (!recortado) return undefined;
  return { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: recortado };
}

export function useEvaluacionesFichasAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoEvaluacionAsesor;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoEvaluacionAsesor, nuevaDireccion: OrdenDireccion) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: [
      'fichas-perfil',
      'asesor-evaluaciones',
      page,
      texto.trim(),
      ordenCampo,
      ordenDireccion,
    ],
    queryFn: () =>
      fichasPerfilService.consultarEvaluacionesFichasAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
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
