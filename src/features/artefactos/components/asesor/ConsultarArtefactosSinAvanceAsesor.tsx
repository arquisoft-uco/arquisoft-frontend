import { FileStack } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { LIMITES } from '../../../../shared/validation';
import { useArtefactosSinAvanceAsesor } from '../../hooks/useArtefactosSinAvanceAsesor';
import { useEstadosRevisionAsesor } from '../../hooks/useEstadosRevisionAsesor';
import {
  textoAlcanceEstadoProyecto,
  type EstadoProyectoListado,
} from '../../utils/estado-proyecto';
import ArtefactosSinAvanceTable from './ArtefactosSinAvanceTable';
import FiltrosArtefactosSinAvance from './FiltrosArtefactosSinAvance';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(
  total: number | undefined,
  dias: number | null,
  estadoProyecto: EstadoProyectoListado,
): string {
  if (total === undefined || dias === null) return '';
  const cantidad = `${total} ${total === 1 ? 'artefacto' : 'artefactos'}`;
  const alcance = textoAlcanceEstadoProyecto(estadoProyecto);
  return `${cantidad} con más de ${dias} días sin avance · ${alcance}`;
}

export default function ConsultarArtefactosSinAvanceAsesor() {
  const listado = useArtefactosSinAvanceAsesor();
  const { data: estados } = useEstadosRevisionAsesor();
  const { data, isLoading, isError, error, isFetching, refetch, dias, errorDias } = listado;
  const artefactos = data?.content ?? [];
  const plazoValido = !errorDias && dias !== null;

  function contenido() {
    if (!plazoValido) {
      return (
        <EmptyState
          icono={FileStack}
          titulo="Indica un plazo válido"
          descripcion={`Escribe un número de días entre ${LIMITES.ARTEFACTO_DIAS_SIN_AVANCE_MIN} y ${LIMITES.ARTEFACTO_DIAS_SIN_AVANCE_MAX} para consultar el reporte.`}
        />
      );
    }
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los artefactos"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      );
    }
    return (
      <ArtefactosSinAvanceTable
        artefactos={artefactos}
        estados={estados ?? []}
        dias={dias}
        cargando={isLoading}
        hayFiltros={listado.hayFiltros}
        orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
        onOrdenar={listado.setOrden}
        onLimpiarFiltros={listado.limpiarFiltros}
      />
    );
  }

  return (
    <div className={RAIZ}>
      <FiltrosArtefactosSinAvance listado={listado} estados={estados} />

      <p aria-live="polite" className={RESUMEN}>
        {plazoValido ? textoResumen(data?.totalElements, dias, listado.filtros.estadoProyecto) : ''}
      </p>

      <div aria-busy={isFetching}>{contenido()}</div>

      {plazoValido && !isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={artefactos.length}
          etiquetaPlural="artefactos"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
