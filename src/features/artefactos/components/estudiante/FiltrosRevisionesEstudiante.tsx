import FilterBar from '../../../../shared/components/ui/FilterBar';
import type { ListadoRevisionesEstudiante } from '../../hooks/useRevisionesEstudiante';

interface Props {
  listado: ListadoRevisionesEstudiante;
}

export default function FiltrosRevisionesEstudiante({ listado }: Props) {
  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar revisiones',
        placeholder: 'Buscar por documento',
      }}
      chips={
        listado.opcionesEstado
          ? {
              etiqueta: 'Estado',
              opciones: listado.opcionesEstado,
              seleccionados: listado.estadoIds,
              onAlternar: listado.toggleEstado,
              onTodos: listado.limpiarEstados,
            }
          : undefined
      }
      fechas={{
        etiqueta: 'Fecha de la revisión',
        desde: listado.desde,
        hasta: listado.hasta,
        onCambiarDesde: listado.setDesde,
        onCambiarHasta: listado.setHasta,
      }}
      aplicados={[]}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}
