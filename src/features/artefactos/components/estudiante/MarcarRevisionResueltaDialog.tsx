import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useMarcarRevisionResuelta } from '../../hooks/useMarcarRevisionResuelta';
import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import { contarObservacionesAbiertas } from '../../utils/avance-observacion';
import { mensajeErrorMarcarRevisionResuelta } from '../../utils/errores-marcar-revision-resuelta';

const CONSECUENCIAS = [
  'Tu asesor recibirá un aviso por correo.',
  'La revisión dejará de estar en progreso.',
  'No podrás cambiar su estado desde esta pantalla.',
];

function avisoAbiertas(abiertas: number): string {
  return abiertas === 1
    ? 'Tienes 1 observación sin solucionar. Márcala como solucionada antes de resolver la revisión.'
    : `Tienes ${abiertas} observaciones sin solucionar. Márcalas como solucionadas antes de resolver la revisión.`;
}

interface Props {
  revisionAsesorId: string;
  nombreDocumento: string;
  version: number;
  onCerrar: () => void;
  onResuelta?: () => void;
}

export default function MarcarRevisionResueltaDialog({
  revisionAsesorId,
  nombreDocumento,
  version,
  onCerrar,
  onResuelta,
}: Props) {
  const mutacion = useMarcarRevisionResuelta();
  const observaciones = useObservacionesRevisionEstudiante(revisionAsesorId);
  const abiertas = contarObservacionesAbiertas(observaciones.data ?? []);

  function confirmar() {
    mutacion.mutate(
      { revisionAsesorId },
      {
        onSuccess: () => {
          toast.success('Revisión marcada como resuelta');
          onResuelta?.();
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo marcar como resuelta',
            mensajeErrorMarcarRevisionResuelta(err, 'Inténtalo nuevamente.'),
          );
          onCerrar();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      titulo="¿Marcar la revisión como resuelta?"
      descripcion={`${nombreDocumento}, versión ${version}.`}
      aviso={abiertas > 0 ? avisoAbiertas(abiertas) : undefined}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Marcar como resuelta"
      variante="advertencia"
      cargando={mutacion.isPending}
      confirmarDeshabilitado={observaciones.isLoading || abiertas > 0}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
