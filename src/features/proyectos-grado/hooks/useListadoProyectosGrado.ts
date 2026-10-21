import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { leerOrden, useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import type { Page } from '../../../shared/models/api-response';
import type { ConsultaCriteriaRequest } from '../../../shared/models/query-criteria';
import type { OrdenCampoProyectoGrado } from '../models/OrdenCampoProyectoGrado';
import type { ProyectoGrado } from '../models/ProyectoGrado';
import { construirFiltros } from '../utils/filtros-proyecto-grado';

const PAGE_SIZE = 10;

type OrdenDireccion = 'ASC' | 'DESC';

const ORDENES = ['tituloProyecto:ASC', 'tituloProyecto:DESC'] as const;

const ORDEN_POR_DEFECTO = 'tituloProyecto:ASC';

interface Opciones {
  rol: 'coordinador' | 'asesor';
  consultar: (req: ConsultaCriteriaRequest) => Promise<Page<ProyectoGrado>>;
}

export function useListadoProyectosGrado({ rol, consultar }: Opciones) {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');
  const estadoIds = parametros.lista('estado');
  const orden = leerOrden(parametros.texto('orden'), ORDENES, ORDEN_POR_DEFECTO);
  const [campo, direccion] = orden.split(':');
  const ordenCampo = campo as OrdenCampoProyectoGrado;
  const ordenDireccion = direccion as OrdenDireccion;

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function setOrden(nuevoCampo: OrdenCampoProyectoGrado, nuevaDireccion: OrdenDireccion = 'ASC') {
    const nuevo = `${nuevoCampo}:${nuevaDireccion}`;
    parametros.cambiar({ orden: nuevo === ORDEN_POR_DEFECTO ? undefined : nuevo });
  }

  function toggleEstado(id: string) {
    const siguientes = estadoIds.includes(id)
      ? estadoIds.filter((e) => e !== id)
      : [...estadoIds, id];
    parametros.cambiar({ estado: siguientes });
  }

  function limpiarEstados() {
    parametros.cambiar({ estado: undefined });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined, estado: undefined });
  }

  const query = useQuery({
    queryKey: ['proyectos-grado', rol, page, texto.trim(), estadoIds, ordenCampo, ordenDireccion],
    queryFn: () =>
      consultar({
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
        filtros: construirFiltros(texto, estadoIds),
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
    estadoIds,
    toggleEstado,
    limpiarEstados,
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
