import { useState } from 'react';
import { CircleCheck, CircleX } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import { resumirEvaluacionesParaDecision } from '../../utils/decision-ficha';

const MENSAJE_FALLBACK = 'Ocurrió un error al registrar la decisión. Intenta nuevamente.';

type Decision = 'aprobar' | 'no-aprobar';

interface Props {
  fichaPerfilId: string;
}

export default function DecidirFichaAcciones({ fichaPerfilId }: Props) {
  const [confirmando, setConfirmando] = useState<Decision | null>(null);
  const { mutate, isPending } = useAgregarEstadoAprobacionFichaPerfil(fichaPerfilId);
  const { data, isLoading, isError } = useEvaluacionesFichaCoordinador(fichaPerfilId);

  const anticipa = !isLoading && !isError && data !== undefined;
  const { hayFinalizada, hayAprobatoria } = resumirEvaluacionesParaDecision(data ?? []);
  const sinFinalizada = anticipa && !hayFinalizada;
  const sinAprobatoria = anticipa && hayFinalizada && !hayAprobatoria;

  const aprobarDeshabilitado = isLoading || isPending || sinFinalizada || sinAprobatoria;
  const noAprobarDeshabilitado = isLoading || isPending || sinFinalizada;

  function confirmar() {
    if (!confirmando) return;
    const aprobar = confirmando === 'aprobar';
    mutate(aprobar, {
      onSuccess: () => {
        toast.success(
          aprobar ? 'Ficha aprobada' : 'Ficha no aprobada',
          'La decisión sobre la ficha quedó registrada.',
        );
        setConfirmando(null);
      },
      onError: (err) => {
        toast.error('No se pudo registrar la decisión', getApiErrorMessage(err, MENSAJE_FALLBACK));
        setConfirmando(null);
      },
    });
  }

  return (
    <>
      <Button
        icono={CircleCheck}
        disabled={aprobarDeshabilitado}
        onClick={() => setConfirmando('aprobar')}
      >
        Aprobar ficha
      </Button>
      <Button
        variante="peligroContorno"
        icono={CircleX}
        disabled={noAprobarDeshabilitado}
        onClick={() => setConfirmando('no-aprobar')}
      >
        No aprobar ficha
      </Button>
      {sinFinalizada && (
        <Notice variante="info">
          Podrás decidir cuando al menos una evaluación esté finalizada.
        </Notice>
      )}
      {sinAprobatoria && (
        <Notice variante="info">
          Para aprobar la ficha, al menos una evaluación debe estar aprobada.
        </Notice>
      )}
      {confirmando === 'aprobar' && (
        <ConfirmDialog
          titulo="¿Aprobar la ficha?"
          descripcion="La ficha quedará aprobada, o aprobada con observaciones si las evaluaciones vigentes las tienen. Se creará el proyecto de grado del equipo. Esta decisión no se puede deshacer."
          labelConfirmar="Aprobar ficha"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(null)}
        />
      )}
      {confirmando === 'no-aprobar' && (
        <ConfirmDialog
          titulo="¿No aprobar la ficha?"
          descripcion="La ficha quedará como no aprobada y no volverá a evaluación. Esta decisión no se puede deshacer."
          labelConfirmar="No aprobar ficha"
          variante="peligro"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(null)}
        />
      )}
    </>
  );
}
