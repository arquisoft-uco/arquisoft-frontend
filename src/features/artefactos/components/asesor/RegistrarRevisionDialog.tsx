import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarRevision } from '../../hooks/useRegistrarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { mensajeDeErrorRegistrarRevision } from '../../utils/errores-registrar-revision';
import { reabreArtefacto } from '../../utils/revision-version';

const CONSECUENCIAS = [
  'La revisión queda pendiente y no se notifica a los estudiantes.',
  'Mientras esté pendiente, los estudiantes no podrán subir versiones nuevas.',
];
const CONSECUENCIA_REAPERTURA =
  'La última revisión de esta versión está cerrada: registrar una nueva reabre el artefacto.';

interface Props {
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function RegistrarRevisionDialog({ version, onCerrar }: Props) {
  const { mutate, isPending } = useRegistrarRevision();
  const consecuencias = reabreArtefacto(version)
    ? [...CONSECUENCIAS, CONSECUENCIA_REAPERTURA]
    : CONSECUENCIAS;

  function handleConfirmar() {
    mutate(version.id, {
      onSuccess: () => {
        toast.success(
          'Revisión registrada',
          `Quedó pendiente la revisión de la versión ${version.version} de «${version.nombreDocumento}».`,
        );
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo registrar la revisión', mensajeDeErrorRegistrarRevision(err));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo="¿Registrar revisión?"
      descripcion={`Vas a registrar una revisión de la versión ${version.version} de «${version.nombreDocumento}» del proyecto «${version.nombreProyecto}».`}
      consecuencias={consecuencias}
      labelConfirmar="Registrar revisión"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
