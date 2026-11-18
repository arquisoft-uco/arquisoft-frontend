import { MessageSquare, Plus } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useObservacionesEvaluacionCuantitativaAsesor } from '../../hooks/useObservacionesEvaluacionCuantitativaAsesor';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';
import {
  EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR,
  OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ROTULO = 'text-xs font-medium text-on-surface-secondary';
const TEXTO = 'break-words text-on-surface';

const COLUMNAS: ColumnaTabla<ObservacionItemAsesor>[] = [
  {
    id: 'descripcion',
    encabezado: 'Observación',
    celda: (fila) => <span className={TEXTO}>{fila.descripcion}</span>,
  },
];

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'observación' : 'observaciones'}`;
}

interface Props {
  evaluacion: EvaluacionCuantitativaAsesor;
  puedeRegistrar?: boolean;
  onRegistrar?: () => void;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionCuantitativaAsesorPanel({
  evaluacion,
  puedeRegistrar = false,
  onRegistrar,
  onCerrar,
}: Props) {
  const { data, isLoading, isFetching, isError, error, refetch, page, pageSize, goToPage } =
    useObservacionesEvaluacionCuantitativaAsesor(evaluacion.id);

  const descripcion = `${evaluacion.item.nombre} · ${evaluacion.puntaje} de ${evaluacion.item.valor}`;

  function contenido() {
    if (isError) {
      if (hasApiErrorCode(error, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA)) {
        return (
          <ErrorState
            titulo="Esta evaluación no está disponible"
            descripcion="Puede que ya no exista. Cierra el panel e inténtalo con otra."
          />
        );
      }
      if (hasApiErrorCode(error, EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR)) {
        return (
          <ErrorState
            titulo="No puedes consultar esta evaluación"
            descripcion="Esta evaluación no está asignada a tu usuario."
          />
        );
      }
      return (
        <ErrorState
          titulo="No se pudieron cargar las observaciones"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }

    const filas = data?.content ?? [];
    return (
      <>
        <div className="section-header">
          <p aria-live="polite" className={RESUMEN}>
            {textoResumen(data?.totalElements)}
          </p>
          {puedeRegistrar && onRegistrar && (
            <Button icono={Plus} className="header-action" onClick={onRegistrar}>
              Registrar observación
            </Button>
          )}
        </div>
        <DataTable
          etiqueta="Observaciones de la evaluación cuantitativa"
          columnas={COLUMNAS}
          filas={filas}
          idDeFila={(fila) => fila.id}
          cargando={isLoading}
          vacio={
            <EmptyState
              icono={MessageSquare}
              titulo="Aún no hay observaciones"
              descripcion="Las observaciones que registres al evaluar este ítem aparecerán aquí."
            />
          }
          tarjeta={(fila) => (
            <>
              <span className={ROTULO}>Observación</span>
              <span className={TEXTO}>{fila.descripcion}</span>
            </>
          )}
        />
        {filas.length > 0 && data && (
          <PaginadorListado
            page={page}
            pageSize={pageSize}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            cantidadEnPagina={filas.length}
            etiquetaPlural="observaciones"
            onPageChange={goToPage}
          />
        )}
      </>
    );
  }

  return (
    <SidePanel titulo="Observaciones" descripcion={descripcion} onCerrar={onCerrar}>
      <div aria-busy={isFetching} className={RAIZ}>
        {contenido()}
      </div>
    </SidePanel>
  );
}
