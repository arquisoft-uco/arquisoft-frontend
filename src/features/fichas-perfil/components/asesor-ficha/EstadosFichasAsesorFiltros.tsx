import Notice from '../../../../shared/components/ui/Notice';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { OpcionFiltro, SeccionFiltro } from '../../../../shared/components/ui/FilterBar';
import type { useEstadosFicha } from '../../hooks/useEstadosFicha';
import type { OrdenDireccion, useEstadosFichasAsesor } from '../../hooks/useEstadosFichasAsesor';

const TODOS: OpcionFiltro = { id: '', etiqueta: 'Todos' };

const OPCIONES_ORDEN: OpcionFiltro[] = [
  { id: 'ASC', etiqueta: 'Ficha (A-Z)' },
  { id: 'DESC', etiqueta: 'Ficha (Z-A)' },
];

function esOrdenDireccion(id: string): id is OrdenDireccion {
  return id === 'ASC' || id === 'DESC';
}

interface Props {
  listado: ReturnType<typeof useEstadosFichasAsesor>;
  estados: ReturnType<typeof useEstadosFicha>;
}

export default function EstadosFichasAsesorFiltros({ listado, estados }: Props) {
  const { estadoId, setEstadoId, setOrden } = listado;
  const opcionesEstado = (estados.data ?? []).map(({ id, nombre }) => ({ id, etiqueta: nombre }));

  const seccionEstado: SeccionFiltro = {
    id: 'estado',
    etiqueta: 'Estado',
    opciones: [TODOS, ...opcionesEstado],
    valor: estadoId,
    onCambiar: setEstadoId,
    deshabilitada: estados.isLoading || estados.isError,
    aviso: estados.isError ? (
      <Notice variante="advertencia">
        No se pudo cargar la lista de estados. Puedes seguir buscando por el título de la ficha.
      </Notice>
    ) : undefined,
  };

  const aplicados = estadoId
    ? [
        {
          id: 'estado',
          etiqueta: `Estado: ${opcionesEstado.find(({ id }) => id === estadoId)?.etiqueta ?? estadoId}`,
          onQuitar: () => setEstadoId(''),
        },
      ]
    : [];

  function cambiarOrden(id: string) {
    if (esOrdenDireccion(id)) setOrden(id);
  }

  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar fichas',
        placeholder: 'Buscar por título de la ficha',
      }}
      popover={{ secciones: [seccionEstado] }}
      orden={{
        etiqueta: 'Ordenar por',
        opciones: OPCIONES_ORDEN,
        valor: listado.ordenDireccion,
        onCambiar: cambiarOrden,
      }}
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}
