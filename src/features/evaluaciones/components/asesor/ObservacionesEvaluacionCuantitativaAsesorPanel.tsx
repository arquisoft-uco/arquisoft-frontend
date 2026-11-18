import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import Button from '../../../../shared/components/ui/Button';
import DataTable, { type ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useObservacionesEvaluacionCuantitativaAsesor } from '../../hooks/useObservacionesEvaluacionCuantitativaAsesor';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';
import ErrorObservacionesAsesor from './ErrorObservacionesAsesor';
import AccionesObservacionItemAsesor from './AccionesObservacionItemAsesor';
import RemoverObservacionItemAsesorDialog from './RemoverObservacionItemAsesorDialog';

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
  puedeModificar?: boolean;
  onModificar?: (observacion: ObservacionItemAsesor) => void;
  puedeRemover?: boolean;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionCuantitativaAsesorPanel({
  evaluacion,
  puedeRegistrar = false,
  onRegistrar,
  puedeModificar = false,
  onModificar,
  puedeRemover = false,
  onCerrar,
}: Props) {
  const [porRemover, setPorRemover] = useState<ObservacionItemAsesor | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch, page, pageSize, goToPage } =
    useObservacionesEvaluacionCuantitativaAsesor(evaluacion.id);
  const descripcion = `${evaluacion.item.nombre} · ${evaluacion.puntaje} de ${evaluacion.item.valor}`;

  function contenido() {
    if (isError)
      return <ErrorObservacionesAsesor error={error} onReintentar={() => void refetch()} />;
    const filas = data?.content ?? [];
    const alModificar = puedeModificar ? onModificar : undefined;
    const hayAcciones = !!alModificar || puedeRemover;
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
          encabezadoAcciones={hayAcciones ? 'Acciones' : undefined}
          acciones={
            hayAcciones
              ? (fila) => (
                  <AccionesObservacionItemAsesor
                    observacion={fila}
                    conVarias={filas.length > 1}
                    onModificar={alModificar}
                    onRemover={puedeRemover ? setPorRemover : undefined}
                  />
                )
              : undefined
          }
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
        <RemoverObservacionItemAsesorDialog
          observacion={porRemover}
          nombreItem={evaluacion.item.nombre}
          onRemovida={handleRemovida}
          onCerrar={() => setPorRemover(null)}
        />
      )}
    </SidePanel>
  );
}
