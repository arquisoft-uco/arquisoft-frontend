import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarVersionArtefacto } from '../../hooks/useEliminarVersionArtefacto';
import type { VersionArtefacto } from '../../models/VersionArtefacto';

const CONSECUENCIAS = [
  'Se elimina de forma definitiva: no se puede deshacer.',
  'Podrás subir otra versión, que tomará el mismo número.',
];

const MENSAJE_ERROR = 'No se pudo eliminar la versión.';

interface Props {
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function EliminarVersionArtefactoDialog({ version, onCerrar }: Props) {
  const mutacion = useEliminarVersionArtefacto();

  function confirmar() {
    mutacion.mutate(version.id, {
      onSuccess: () => {
        toast.success('Versión eliminada');
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo eliminar la versión', getApiErrorMessage(err, MENSAJE_ERROR));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo={`¿Eliminar la versión ${version.version} de «${version.nombreDocumento}»?`}
      descripcion="Se retira el archivo que subiste y el asesor ya no podrá verlo."
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Eliminar versión"
      variante="peligro"
      cargando={mutacion.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
