import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useMarcarRevisionResuelta } from '../../hooks/useMarcarRevisionResuelta';
import { useObservacionesRevisionEstudiante } from '../../hooks/useObservacionesRevisionEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
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
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function MarcarRevisionResueltaDialog({ version, onCerrar }: Props) {
  const mutacion = useMarcarRevisionResuelta();
  const observaciones = useObservacionesRevisionEstudiante(version.revisionAsesor);
  const abiertas = contarObservacionesAbiertas(observaciones.data ?? []);

  function confirmar() {
    if (!version.revisionAsesor) return;
    mutacion.mutate(
      { revisionAsesorId: version.revisionAsesor },
      {
        onSuccess: () => {
          toast.success('Revisión marcada como resuelta');
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
      descripcion={`${version.nombreDocumento}, versión ${version.version}.`}
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
