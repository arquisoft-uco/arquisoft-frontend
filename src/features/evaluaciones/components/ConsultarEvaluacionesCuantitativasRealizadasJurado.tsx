import { useState } from 'react';
import { Calculator, MessageSquare, Pencil } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import Notice from '../../../shared/components/ui/Notice';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../models/ObservacionItemJurado';
import CambiarPuntajeEvaluacionCuantitativaJuradoPanel from './jurado/CambiarPuntajeEvaluacionCuantitativaJuradoPanel';
import ErrorConsultaCuantitativasRealizadasJurado from './ErrorConsultaCuantitativasRealizadasJurado';
import ModificarObservacionItemJuradoPanel from './jurado/ModificarObservacionItemJuradoPanel';
import EvaluacionesCuantitativasJuradoTable from './EvaluacionesCuantitativasJuradoTable';
import ObservacionesEvaluacionCuantitativaPanel from './jurado/ObservacionesEvaluacionCuantitativaPanel';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'evaluación cuantitativa' : 'evaluaciones cuantitativas'}`;
}

export interface ConsultaCuantitativas {
  data?: EvaluacionCuantitativaJurado[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface Props {
  consulta: ConsultaCuantitativas;
  etiquetaVolver: string;
  onVolver: () => void;
  onEvaluar?: () => void;
  evaluacionJuradoId: string;
  evaluacionFinalizada?: boolean;
}

type PanelAbierto =
  | { tipo: 'puntaje'; valoracion: EvaluacionCuantitativaJurado }
  | { tipo: 'lectura'; valoracion: EvaluacionCuantitativaJurado }
  | {
      tipo: 'edicion';
      valoracion: EvaluacionCuantitativaJurado;
      observacion: ObservacionItemJurado;
    };

export default function ConsultarEvaluacionesCuantitativasRealizadasJurado({
  consulta,
  etiquetaVolver,
  onVolver,
  onEvaluar,
  evaluacionJuradoId,
  evaluacionFinalizada = false,
}: Props) {
  const [panel, setPanel] = useState<PanelAbierto | null>(null);
  const { data, isLoading, isError, error, refetch } = consulta;

  if (isError) {
    return (
      <ErrorConsultaCuantitativasRealizadasJurado
        error={error}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        onReintentar={() => void refetch()}
      />
    );
  }

  const vacio = (
    <EmptyState
      icono={Calculator}
      titulo="Aún no registraste evaluaciones cuantitativas"
      descripcion="Aparecerán aquí cuando registres tus puntajes."
      accion={onEvaluar && <Button onClick={onEvaluar}>Evaluar cuantitativas</Button>}
    />
  );

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.length)}
      </p>
      {evaluacionFinalizada && (data?.length ?? 0) > 0 && (
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden cambiar puntajes.
        </Notice>
      )}
      <EvaluacionesCuantitativasJuradoTable
        evaluaciones={data ?? []}
        cargando={isLoading}
        vacio={vacio}
        acciones={(fila) => (
          <div className="flex shrink-0 items-center justify-end gap-1">
            <IconButton
              etiqueta={`Ver observaciones de ${fila.item.nombre}`}
              rotulo="Ver observaciones"
              icono={MessageSquare}
              onClick={() => setPanel({ tipo: 'lectura', valoracion: fila })}
            />
            {!evaluacionFinalizada && (
              <IconButton
                etiqueta={`Cambiar puntaje de ${fila.item.nombre}`}
                rotulo="Cambiar puntaje"
                icono={Pencil}
                onClick={() => setPanel({ tipo: 'puntaje', valoracion: fila })}
              />
            )}
          </div>
        )}
      />
      {panel?.tipo === 'puntaje' && (
        <CambiarPuntajeEvaluacionCuantitativaJuradoPanel
          fila={panel.valoracion}
          evaluacionJuradoId={evaluacionJuradoId}
          onCerrar={() => setPanel(null)}
        />
      )}
      {panel?.tipo === 'lectura' && (
        <ObservacionesEvaluacionCuantitativaPanel
          evaluacion={panel.valoracion}
          puedeModificar={!evaluacionFinalizada}
          puedeRemover={!evaluacionFinalizada}
          onModificar={(observacion) =>
            setPanel({ tipo: 'edicion', valoracion: panel.valoracion, observacion })
          }
          onCerrar={() => setPanel(null)}
        />
      )}
      {panel?.tipo === 'edicion' && (
        <ModificarObservacionItemJuradoPanel
          observacion={panel.observacion}
          nombreItem={panel.valoracion.item.nombre}
          onCerrar={() => setPanel({ tipo: 'lectura', valoracion: panel.valoracion })}
        />
      )}
    </div>
  );
}
