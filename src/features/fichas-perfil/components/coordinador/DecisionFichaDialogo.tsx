import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';

export type Decision = 'aprobar' | 'no-aprobar';

const MENSAJE_FALLBACK = 'Ocurrió un error al registrar la decisión. Intenta nuevamente.';

const CONSECUENCIAS_APROBAR = [
  'La ficha quedará aprobada, o aprobada con observaciones si las evaluaciones vigentes las tienen.',
  'Se creará el proyecto de grado del equipo.',
  'Esta decisión no se puede deshacer.',
];
const CONSECUENCIAS_NO_APROBAR = [
  'La ficha quedará como no aprobada.',
  'No volverá a evaluación.',
  'Esta decisión no se puede deshacer.',
];

interface Props {
  fichaPerfilId: string;
  decision: Decision;
  onCerrar: () => void;
}

export default function DecisionFichaDialogo({ fichaPerfilId, decision, onCerrar }: Props) {
  const { mutate, isPending } = useAgregarEstadoAprobacionFichaPerfil(fichaPerfilId);
  const aprobar = decision === 'aprobar';

  function confirmar() {
    mutate(aprobar, {
      onSuccess: () => {
        toast.success(
          aprobar ? 'Ficha aprobada' : 'Ficha no aprobada',
          'La decisión sobre la ficha quedó registrada.',
        );
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo registrar la decisión', getApiErrorMessage(err, MENSAJE_FALLBACK));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo={aprobar ? '¿Aprobar la ficha?' : '¿No aprobar la ficha?'}
      consecuencias={aprobar ? CONSECUENCIAS_APROBAR : CONSECUENCIAS_NO_APROBAR}
      labelConfirmar={aprobar ? 'Aprobar ficha' : 'No aprobar ficha'}
      variante={aprobar ? 'advertencia' : 'peligro'}
      cargando={isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
