import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEnviarRevision } from '../../hooks/useEnviarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import {
  mensajeDeErrorEnviarRevision,
  revisionYaNoEnviable,
} from '../../utils/errores-enviar-revision';

const CONSECUENCIAS = [
  'Se envía un correo a los estudiantes vinculados al artefacto.',
  'Los estudiantes podrán ver las observaciones y subir una nueva versión.',
  'La revisión y sus observaciones ya no se podrán cambiar.',
];

interface Props {
  version: VersionArtefacto;
  revisionAsesorId: string;
  onCerrar: () => void;
  onSalir: () => void;
}

export default function EnviarRevisionDialog({
  version,
  revisionAsesorId,
  onCerrar,
  onSalir,
}: Props) {
  const { mutate, isPending } = useEnviarRevision();

  function handleConfirmar() {
    mutate(
      { revisionAsesorId },
      {
        onSuccess: () => {
          toast.success(
            'Revisión enviada',
            `Los estudiantes recibirán un correo con las observaciones de la versión ${version.version} de «${version.nombreDocumento}».`,
          );
          onCerrar();
          onSalir();
        },
        onError: (err) => {
          toast.error('No se pudo enviar la revisión', mensajeDeErrorEnviarRevision(err));
          onCerrar();
          if (revisionYaNoEnviable(err)) onSalir();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo="¿Enviar revisión?"
      descripcion={`Vas a enviar la revisión de la versión ${version.version} de «${version.nombreDocumento}» del proyecto «${version.nombreProyecto}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Enviar revisión"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
