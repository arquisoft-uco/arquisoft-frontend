import FilterBar from '../../../shared/components/ui/FilterBar';
import Notice from '../../../shared/components/ui/Notice';
import { useEstadosRespuesta } from '../hooks/useEstadosRespuesta';
import type { FiltrosRespuestas } from '../hooks/useFiltrosRespuestas';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasFiltros({ filtros }: Props) {
  const estados = useEstadosRespuesta();

  if (estados.isError) {
    return (
      <Notice variante="advertencia">
        No se pudo cargar la lista de estados. El listado sigue disponible.
      </Notice>
    );
  }

  if (!estados.data || estados.data.length === 0) return null;

  return (
    <FilterBar
      chips={{
        etiqueta: 'Estado',
        opciones: estados.data.map(({ id, nombre }) => ({ id, etiqueta: nombre })),
        seleccionados: filtros.estadoIds,
        onAlternar: filtros.toggleEstado,
        onTodos: filtros.limpiarFiltros,
      }}
      aplicados={[]}
      onLimpiar={filtros.limpiarFiltros}
    />
  );
}
