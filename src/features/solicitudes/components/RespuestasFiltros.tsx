import FilterBar from '../../../shared/components/ui/FilterBar';
import Notice from '../../../shared/components/ui/Notice';
import { useEstadosRespuesta } from '../hooks/useEstadosRespuesta';
import type { FiltrosRespuestas } from '../hooks/useFiltrosRespuestas';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasFiltros({ filtros }: Props) {
  const estados = useEstadosRespuesta();

  return (
    <div className="flex flex-col gap-3">
      <FilterBar
        busqueda={{
          valor: filtros.texto,
          onCambiar: filtros.setTexto,
          etiqueta: 'Buscar respuestas',
          placeholder: 'Buscar en el contenido de la respuesta',
        }}
        chips={
          estados.data
            ? {
                etiqueta: 'Estado',
                opciones: estados.data.map(({ id, nombre }) => ({ id, etiqueta: nombre })),
                seleccionados: filtros.estadoIds,
                onAlternar: filtros.toggleEstado,
                onTodos: filtros.limpiarEstados,
              }
            : undefined
        }
        aplicados={[]}
        onLimpiar={filtros.limpiarFiltros}
      />
      {estados.isError && (
        <Notice variante="advertencia">
          No se pudo cargar la lista de estados. La búsqueda y el listado siguen disponibles.
        </Notice>
      )}
    </div>
  );
}
