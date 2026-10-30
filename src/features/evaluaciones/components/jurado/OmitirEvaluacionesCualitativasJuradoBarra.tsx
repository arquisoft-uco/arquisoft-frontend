import { useRef, useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useOmitirEvaluacionesCualitativasJurado } from '../../hooks/useOmitirEvaluacionesCualitativasJurado';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS,
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import { mensajeErrorOmitirEvaluacionesCualitativas } from '../../utils/errores-omitir-evaluaciones-cualitativas';

const RAIZ = 'flex flex-wrap items-center justify-between gap-3';
const TODAS = 'tap-target inline-flex cursor-pointer items-center gap-2 text-sm text-on-surface';
const CASILLA = 'checkbox-control shrink-0 accent-primary';

interface Props {
  evaluacionJuradoId: string;
  idsTodas: string[];
  seleccionadas: string[];
  onSeleccionarTodas: () => void;
  onLimpiarSeleccion: () => void;
}

export default function OmitirEvaluacionesCualitativasJuradoBarra({
  evaluacionJuradoId,
  idsTodas,
  seleccionadas,
  onSeleccionarTodas,
  onLimpiarSeleccion,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const omitir = useOmitirEvaluacionesCualitativasJurado(evaluacionJuradoId);
  const casilla = useRef<HTMLInputElement>(null);
  const cantidad = seleccionadas.length;
  const todas = cantidad > 0 && cantidad === idsTodas.length;
  const sustantivo = cantidad === 1 ? 'evaluación cualitativa' : 'evaluaciones cualitativas';
  if (casilla.current) casilla.current.indeterminate = cantidad > 0 && !todas;

  function confirmar() {
    omitir.mutate(seleccionadas, {
      onSuccess: () => {
        toast.success('Evaluaciones omitidas', 'Se quitaron de tu evaluación.');
        onLimpiarSeleccion();
        setConfirmando(false);
      },
      onError: (err) => {
        toast.error('No se pudo omitir', mensajeErrorOmitirEvaluacionesCualitativas(err));
        if (
          hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACIONES_NO_ENCONTRADAS) ||
          hasApiErrorCode(err, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA)
        ) {
          onLimpiarSeleccion();
        }
        setConfirmando(false);
      },
    });
  }

  return (
    <div className={RAIZ}>
      <label className={TODAS}>
        <input
          ref={casilla}
          type="checkbox"
          checked={todas}
          onChange={() => (todas ? onLimpiarSeleccion() : onSeleccionarTodas())}
          className={CASILLA}
        />
        Seleccionar todas
      </label>
      <Button
        type="button"
        variante="peligro"
        disabled={cantidad === 0}
        onClick={() => setConfirmando(true)}
      >
        Omitir ({cantidad})
      </Button>
      {confirmando && (
        <ConfirmDialog
          titulo={`¿Omitir ${cantidad} ${sustantivo}?`}
          consecuencias={['Se quitarán de tu evaluación.', 'No se puede deshacer.']}
          labelConfirmar="Omitir"
          variante="peligro"
          cargando={omitir.isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </div>
  );
}
