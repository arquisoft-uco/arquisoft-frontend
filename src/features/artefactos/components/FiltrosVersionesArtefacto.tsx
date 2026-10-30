import FilterBar from '../../../shared/components/ui/FilterBar';
import Notice from '../../../shared/components/ui/Notice';
import type { ListadoVersionesArtefacto } from '../hooks/useListadoVersionesArtefacto';

const RAIZ = 'flex flex-col gap-3';

interface Props {
  listado: ListadoVersionesArtefacto;
}

export default function FiltrosVersionesArtefacto({ listado }: Props) {
  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar artefactos',
          placeholder: 'Buscar por documento o proyecto',
          deshabilitada: !listado.busquedaDisponible,
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
      {!listado.busquedaDisponible && (
        <Notice variante="advertencia">
          No se pudo cargar la lista de artefactos. La búsqueda por nombre no está disponible; las
          fechas siguen funcionando.
        </Notice>
      )}
    </div>
  );
}
