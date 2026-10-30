import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEntregablesAsesor } from '../../hooks/useEntregablesAsesor';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import CambiarEstadoEntregablePanel from './CambiarEstadoEntregablePanel';
import EntregablesAsesorTable from './EntregablesAsesorTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'entregable' : 'entregables'}`;
}

export default function ConsultarEntregablesAsesor() {
  const listado = useEntregablesAsesor();
  const { data: estados } = useEstadosEntregable();
  const [enEdicion, setEnEdicion] = useState<EntregableProyectoGrado | null>(null);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const entregables = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '' || listado.estadoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && entregables.length === 0 && !hayFiltros;
  const opciones = estados?.map((estado) => ({ id: estado.id, etiqueta: estado.nombre }));

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar proyectos',
          placeholder: 'Buscar por nombre del proyecto',
        }}
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
            titulo="No se pudieron cargar los entregables"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EntregablesAsesorTable
            entregables={entregables}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onCambiarEstado={setEnEdicion}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={entregables.length}
          etiquetaPlural="entregables"
          onPageChange={listado.goToPage}
        />
      )}

      {enEdicion && (
        <CambiarEstadoEntregablePanel entregable={enEdicion} onCerrar={() => setEnEdicion(null)} />
      )}
    </div>
  );
}
