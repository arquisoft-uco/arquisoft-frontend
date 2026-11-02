import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useMarcarRevisionResuelta } from '../../hooks/useMarcarRevisionResuelta';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { mensajeErrorMarcarRevisionResuelta } from '../../utils/errores-marcar-revision-resuelta';

const CONSECUENCIAS = [
  'Tu asesor recibirá un aviso por correo.',
  'La revisión dejará de estar en progreso.',
  'No podrás cambiar su estado desde esta pantalla.',
];

interface Props {
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function MarcarRevisionResueltaDialog({ version, onCerrar }: Props) {
  const mutacion = useMarcarRevisionResuelta();

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
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Marcar como resuelta"
      variante="advertencia"
      cargando={mutacion.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
