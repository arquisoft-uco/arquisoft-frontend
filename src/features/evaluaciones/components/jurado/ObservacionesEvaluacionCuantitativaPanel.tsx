import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useObservacionesEvaluacionCuantitativaJurado } from '../../hooks/useObservacionesEvaluacionCuantitativaJurado';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';
import { OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA } from '../../utils/codigos-error-evaluaciones';
import AccionesObservacionItemJurado from './AccionesObservacionItemJurado';
import RemoverObservacionItemJuradoDialog from './RemoverObservacionItemJuradoDialog';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const ROTULO = 'text-xs font-medium text-on-surface-secondary';
const TEXTO = 'break-words text-on-surface';

const COLUMNAS: ColumnaTabla<ObservacionItemJurado>[] = [
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
  evaluacion: EvaluacionCuantitativaJurado;
  puedeModificar?: boolean;
  puedeRemover?: boolean;
  onModificar?: (observacion: ObservacionItemJurado) => void;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionCuantitativaPanel({
  evaluacion,
  puedeModificar = false,
  puedeRemover = false,
  onModificar,
  onCerrar,
}: Props) {
  const [porRemover, setPorRemover] = useState<ObservacionItemJurado | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch, page, pageSize, goToPage } =
    useObservacionesEvaluacionCuantitativaJurado(evaluacion.id);

  const descripcion = `${evaluacion.item.nombre} · ${evaluacion.puntaje} de ${evaluacion.item.valor}`;

  function contenido() {
    if (isError) {
      if (hasApiErrorCode(error, OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA)) {
        return (
          <ErrorState
            titulo="Esta evaluación no está disponible"
            descripcion="Puede que ya no exista. Cierra el panel e inténtalo con otra."
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
    const ofreceModificar = puedeModificar && !!onModificar;
    const hayAcciones = ofreceModificar || puedeRemover;
    return (
      <>
        <p aria-live="polite" className={RESUMEN}>
          {textoResumen(data?.totalElements)}
        </p>
        <DataTable
          etiqueta="Observaciones de la evaluación cuantitativa"
          columnas={COLUMNAS}
          filas={filas}
          idDeFila={(fila) => fila.id}
          cargando={isLoading}
          acciones={
            hayAcciones
              ? (fila) => (
                  <AccionesObservacionItemJurado
                    observacion={fila}
                    conVarias={filas.length > 1}
                    onModificar={ofreceModificar ? onModificar : undefined}
                    onRemover={puedeRemover ? setPorRemover : undefined}
                  />
                )
              : undefined
          }
          encabezadoAcciones={hayAcciones ? 'Acciones' : undefined}
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

  function handleRemovida() {
    if ((data?.content.length ?? 0) === 1 && page > 0) goToPage(page - 1);
  }

  return (
    <SidePanel titulo="Observaciones" descripcion={descripcion} onCerrar={onCerrar}>
      <div aria-busy={isFetching} className={RAIZ}>
        {contenido()}
      </div>
      {porRemover && (
        <RemoverObservacionItemJuradoDialog
          observacion={porRemover}
          nombreItem={evaluacion.item.nombre}
          onRemovida={handleRemovida}
          onCerrar={() => setPorRemover(null)}
        />
      )}
    </SidePanel>
  );
}
