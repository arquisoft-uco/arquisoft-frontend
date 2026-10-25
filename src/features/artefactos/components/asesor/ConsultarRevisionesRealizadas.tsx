import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosRevisionAsesor } from '../../hooks/useEstadosRevisionAsesor';
import { useRevisionesRealizadasAsesor } from '../../hooks/useRevisionesRealizadasAsesor';
import type { RevisionAsesor } from '../../models/RevisionAsesor';
import ObservacionesRevisionPanel from './ObservacionesRevisionPanel';
import RevisionesRealizadasTable from './RevisionesRealizadasTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'revisión' : 'revisiones'}`;
}

export default function ConsultarRevisionesRealizadas() {
  const listado = useRevisionesRealizadasAsesor();
  const { data: estados } = useEstadosRevisionAsesor();
  const [seleccionada, setSeleccionada] = useState<RevisionAsesor | null>(null);

  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const revisiones = data?.content ?? [];
  const hayFiltros = listado.estadoIds.length > 0;
  const opciones = estados?.map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  return (
    <div className={RAIZ}>
      <FilterBar
        chips={
          opciones && {
            etiqueta: 'Estado',
            opciones,
            seleccionados: listado.estadoIds,
            onAlternar: listado.toggleEstado,
            onTodos: listado.limpiarEstados,
          }
        }
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las revisiones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <RevisionesRealizadasTable
            revisiones={revisiones}
            cargando={isLoading}
            hayFiltros={hayFiltros}
            direccionOrden={listado.direccionOrden}
            onOrdenar={listado.setDireccionOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onVerObservaciones={setSeleccionada}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={revisiones.length}
          etiquetaPlural="revisiones"
          onPageChange={listado.goToPage}
        />
      )}

      {seleccionada && (
        <ObservacionesRevisionPanel
          revisionAsesorId={seleccionada.id}
          onCerrar={() => setSeleccionada(null)}
        />
      )}
    </div>
  );
}
