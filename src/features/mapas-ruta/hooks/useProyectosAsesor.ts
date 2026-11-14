import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { mapasRutaService } from '../services/mapasRutaService';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

type OrdenCampoProyectoAsesorado = 'tituloProyecto';

const ORDENES = ['tituloProyecto:ASC', 'tituloProyecto:DESC'] as const;

const ORDEN_POR_DEFECTO = 'tituloProyecto:ASC';

function construirFiltroTitulo(texto: string): NodoFiltroDTO | undefined {
  const recortado = texto.trim();
  if (!recortado) return undefined;
  return { tipo: 'PREDICADO', campo: 'tituloProyecto', operador: 'CONTIENE', valor: recortado };
}

export function useProyectosAsesor() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoProyectoAsesorado;
  const ordenDireccion = direccion as OrdenDireccion;

  const hayFiltros = texto.trim() !== '';

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(
    nuevoCampo: OrdenCampoProyectoAsesorado,
    nuevaDireccion: OrdenDireccion = 'ASC',
  ) {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: ['mapas-ruta', 'asesor', 'proyectos', page, texto.trim(), ordenDireccion],
    queryFn: () =>
      mapasRutaService.consultarProyectosAsesor({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
        filtros: construirFiltroTitulo(texto),
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
    hayFiltros,
  };
}
