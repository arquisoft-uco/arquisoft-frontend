import FilterBar from '../../../shared/components/ui/FilterBar';
import type { ListadoVersionesArtefacto } from '../hooks/useListadoVersionesArtefacto';

interface Props {
  listado: ListadoVersionesArtefacto;
}

export default function FiltrosVersionesArtefacto({ listado }: Props) {
  return (
    <FilterBar
      busqueda={{
        valor: listado.texto,
        onCambiar: listado.setTexto,
        etiqueta: 'Buscar artefactos',
        placeholder: 'Buscar por documento o proyecto',
      }}
      fechas={{
        etiqueta: 'Fecha de creación',
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
