import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useCerrarRevision } from '../../hooks/useCerrarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import {
  mensajeDeErrorCerrarRevision,
  revisionYaNoCerrable,
} from '../../utils/errores-cerrar-revision';

const CONSECUENCIAS = [
  'Se envía un correo a los estudiantes vinculados avisando que el documento quedó completado.',
  'Los estudiantes ya no podrán subir nuevas versiones de este artefacto.',
  'La revisión queda cerrada y no se puede enviar.',
  'Para reabrirlo, registra otra revisión del artefacto.',
];

interface Props {
  version: VersionArtefacto;
  revisionAsesorId: string;
  onCerrar: () => void;
  onSalir: () => void;
}

export default function CerrarRevisionDialog({
  version,
  revisionAsesorId,
  onCerrar,
  onSalir,
}: Props) {
  const { mutate, isPending } = useCerrarRevision();

  function handleConfirmar() {
    mutate(
      { revisionAsesorId },
      {
        onSuccess: () => {
          toast.success(
            'Artefacto completado',
            `Los estudiantes recibirán un correo con el aviso de «${version.nombreDocumento}».`,
          );
          onCerrar();
          onSalir();
        },
        onError: (err) => {
          toast.error('No se pudo dar por completado', mensajeDeErrorCerrarRevision(err));
          onCerrar();
          if (revisionYaNoCerrable(err)) onSalir();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo="¿Dar por completado este artefacto?"
      descripcion={`Vas a dar por completada la versión ${version.version} de «${version.nombreDocumento}» del proyecto «${version.nombreProyecto}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Dar por completado"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
