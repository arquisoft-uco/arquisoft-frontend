import FilterBar from '../../../shared/components/ui/FilterBar';
import type { OpcionFiltro } from '../../../shared/components/ui/FilterBar';
import type { ListadoVersionesArtefacto } from '../hooks/useListadoVersionesArtefacto';

interface Props {
  listado: ListadoVersionesArtefacto;
  opcionesEstado?: OpcionFiltro[];
}

export default function FiltrosVersionesArtefacto({ listado, opcionesEstado }: Props) {
  const nombreArtefacto = listado.data?.content[0]?.nombreDocumento ?? 'seleccionado';
  const aplicados = listado.artefacto
    ? [
        {
          id: 'artefacto',
          etiqueta: `Artefacto: ${nombreArtefacto}`,
          onQuitar: listado.quitarArtefacto,
        },
      ]
    : [];

  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar artefactos',
        placeholder: 'Buscar por documento o proyecto',
      }}
      chips={
        opcionesEstado
          ? {
              etiqueta: 'Estado',
              opciones: opcionesEstado,
              seleccionados: listado.estadoIds,
              onAlternar: listado.toggleEstado,
              onTodos: listado.limpiarEstados,
            }
          : undefined
      }
      fechas={{
        etiqueta: 'Fecha de creación',
        desde: listado.desde,
        hasta: listado.hasta,
        onCambiarDesde: listado.setDesde,
        onCambiarHasta: listado.setHasta,
      }}
      aplicados={aplicados}
      onLimpiar={listado.limpiarFiltros}
      totalResultados={listado.data?.totalElements}
    />
  );
}
