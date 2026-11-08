import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarRevision } from '../../hooks/useEliminarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import {
  mensajeDeErrorEliminarRevision,
  revisionYaNoEliminable,
} from '../../utils/errores-eliminar-revision';

const CONSECUENCIAS = [
  'Esta acción no se puede deshacer.',
  'Se eliminan también todas las observaciones de la revisión.',
  'Los estudiantes no reciben ningún aviso.',
  'Si es la última versión, no se podrá subir otra hasta que registres una nueva revisión.',
];

interface Props {
  version: VersionArtefacto;
  revisionAsesorId: string;
  onCerrar: () => void;
  onSalir: () => void;
}

export default function EliminarRevisionDialog({
  version,
  revisionAsesorId,
  onCerrar,
  onSalir,
}: Props) {
  const { mutate, isPending } = useEliminarRevision();

  function handleConfirmar() {
    mutate(
      { revisionAsesorId },
      {
        onSuccess: () => {
          toast.success(
            'Revisión eliminada',
            `Se eliminó la revisión de «${version.nombreDocumento}».`,
          );
          onCerrar();
          onSalir();
        },
        onError: (err) => {
          toast.error('No se pudo eliminar la revisión', mensajeDeErrorEliminarRevision(err));
          onCerrar();
          if (revisionYaNoEliminable(err)) onSalir();
        },
      },
    );
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Eliminar esta revisión?"
      descripcion={`Vas a eliminar la revisión de la versión ${version.version} de «${version.nombreDocumento}» del proyecto «${version.nombreProyecto}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Eliminar revisión"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
