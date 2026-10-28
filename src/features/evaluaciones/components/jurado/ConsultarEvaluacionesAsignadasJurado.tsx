import { ClipboardList, ClipboardPen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useHasRole } from '../../../../hooks/useHasRole';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import IconButton from '../../../../shared/components/ui/IconButton';
import { Rol } from '../../../../shared/models/rol';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEvaluacionesAsignadasJurado } from '../../hooks/useEvaluacionesAsignadasJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import type { NavegacionCualitativasRealizadasJurado } from '../../models/NavegacionCualitativasRealizadasJurado';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import { OPCIONES_ESTADO_JURADO } from '../../utils/estados-evaluacion-jurado';
import EvaluacionesAsignadasJuradoTable from './EvaluacionesAsignadasJuradoTable';

const ROLES_REGISTRAN = [Rol.Jurado];
const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ACCIONES = 'flex items-center gap-1';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación asignada' : 'evaluaciones asignadas'}`;
}

export default function ConsultarEvaluacionesAsignadasJurado() {
  const navigate = useNavigate();
  const location = useLocation();
  const puedeEvaluar = useHasRole(ROLES_REGISTRAN);
  const listado = useEvaluacionesAsignadasJurado();
  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = listado;
  const evaluaciones = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '' || listado.estadoJuradoIds.length > 0;
  const recargandoSinFilas = isPlaceholderData && evaluaciones.length === 0 && !hayFiltros;

  function verCualitativas(asignacion: EvaluacionAsignadaJurado) {
    const state: NavegacionCualitativasRealizadasJurado = {
      evaluacionJuradoId: asignacion.id,
      search: location.search,
      resumen: { proyecto: asignacion.entregable.proyecto, version: asignacion.entregable.version },
    };
    navigate(`/evaluaciones/${asignacion.id}/cualitativas-realizadas`, { state });
  }

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar evaluaciones',
          placeholder: 'Buscar por nombre del proyecto',
        }}
        chips={{
          etiqueta: 'Estado',
          opciones: OPCIONES_ESTADO_JURADO,
          seleccionados: listado.estadoJuradoIds,
          onAlternar: listado.toggleEstadoJurado,
          onTodos: listado.limpiarEstadosJurado,
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
      />

      <p aria-live="polite" className={RESUMEN}>
        {isLoading || isError ? '' : textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar tus evaluaciones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <EvaluacionesAsignadasJuradoTable
            evaluaciones={evaluaciones}
            cargando={isLoading || recargandoSinFilas}
            hayFiltros={hayFiltros}
            onLimpiarFiltros={listado.limpiarFiltros}
            encabezadoAcciones={puedeEvaluar ? 'Acciones' : undefined}
            acciones={
              puedeEvaluar
                ? (asignacion) => (
                    <div className={ACCIONES}>
                      {asignacion.tieneEvaluacionesCualitativas && (
                        <IconButton
                          etiqueta={`Ver cualitativas de ${asignacion.entregable.proyecto}`}
                          icono={ClipboardList}
                          tono="neutro"
                          rotulo="Ver cualitativas"
                          onClick={() => verCualitativas(asignacion)}
                        />
                      )}
                      <IconButton
                        etiqueta={`Evaluar ${asignacion.entregable.proyecto}`}
                        icono={ClipboardPen}
                        tono="primario"
                        rotulo="Evaluar"
                        disabled={asignacion.evaluacion.estado.id === ESTADO_FINALIZADA}
                        onClick={() => navigate(`/evaluaciones/${asignacion.id}/evaluar`)}
                      />
                    </div>
                  )
                : undefined
            }
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={evaluaciones.length}
          etiquetaPlural="evaluaciones"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
