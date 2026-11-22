import { useState } from 'react';
import { Calculator, MessageSquare, Pencil } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../models/ObservacionItemJurado';
import type { useEdicionPuntajeEnLineaJurado } from '../hooks/useEdicionPuntajeEnLineaJurado';
import EditorPuntajeEnLineaJurado from './jurado/EditorPuntajeEnLineaJurado';
import ErrorConsultaCuantitativasRealizadasJurado from './ErrorConsultaCuantitativasRealizadasJurado';
import ModificarObservacionItemJuradoPanel from './jurado/ModificarObservacionItemJuradoPanel';
import EvaluacionesCuantitativasJuradoTable from './EvaluacionesCuantitativasJuradoTable';
import type { SeleccionCuantitativas } from './EvaluacionesCuantitativasJuradoTable';
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
  evaluacionFinalizada?: boolean;
  seleccion?: SeleccionCuantitativas;
  edicionPuntaje?: ReturnType<typeof useEdicionPuntajeEnLineaJurado>;
}

type PanelAbierto =
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
  evaluacionFinalizada = false,
  seleccion,
  edicionPuntaje,
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

  const edicion = edicionPuntaje?.edicion;
  const celdaPuntaje = edicionPuntaje
    ? (fila: EvaluacionCuantitativaJurado) =>
        edicion?.filaId === fila.id ? (
          <EditorPuntajeEnLineaJurado
            nombreItem={edicion.nombreItem}
            valorMaximo={edicion.valorMaximo}
            valor={edicion.valor}
            error={edicion.error}
            guardando={edicionPuntaje.guardando}
            onCambiar={edicionPuntaje.cambiar}
            onGuardar={edicionPuntaje.guardar}
            onCancelar={edicionPuntaje.cancelar}
          />
        ) : null
    : undefined;

  const vacio = (
    <EmptyState
      icono={Calculator}
      titulo="Aún no registraste evaluaciones cuantitativas"
      descripcion="Aparecerán aquí cuando registres tus puntajes."
    />
  );

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.length)}
      </p>
      <EvaluacionesCuantitativasJuradoTable
        evaluaciones={data ?? []}
        cargando={isLoading}
        vacio={vacio}
        seleccion={seleccion}
        celdaPuntaje={celdaPuntaje}
        acciones={(fila) => (
          <div className="flex shrink-0 items-center justify-end gap-1">
            <IconButton
              etiqueta={`Ver observaciones de ${fila.item.nombre}`}
              rotulo="Ver observaciones"
              icono={MessageSquare}
              onClick={() => setPanel({ tipo: 'lectura', valoracion: fila })}
            />
            {edicionPuntaje && edicionPuntaje.edicion?.filaId !== fila.id && (
              <IconButton
                etiqueta={`Cambiar puntaje de ${fila.item.nombre}`}
                rotulo="Cambiar puntaje"
                icono={Pencil}
                data-accion-fila={fila.id}
                onClick={() => edicionPuntaje.iniciar(fila)}
              />
            )}
          </div>
        )}
      />
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
