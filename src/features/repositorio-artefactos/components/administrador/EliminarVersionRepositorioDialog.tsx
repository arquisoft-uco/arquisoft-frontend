import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import type { VersionRepositorioArtefacto } from '../../../../shared/models/VersionRepositorioArtefacto';
import { useEliminarVersionRepositorio } from '../../hooks/useEliminarVersionRepositorio';
import { mensajeErrorEliminarVersion } from '../../utils/errores-eliminar-version';

interface Props {
  version: VersionRepositorioArtefacto;
  repositorioId: string;
  onCerrar: () => void;
}

export default function EliminarVersionRepositorioDialog({
  version,
  repositorioId,
  onCerrar,
}: Props) {
  const eliminar = useEliminarVersionRepositorio(repositorioId);

  function confirmarEliminacion() {
    eliminar.mutate(version.id, {
      onSuccess: () => {
        toast.success(
          'Versión eliminada',
          'El archivo se retirará del almacenamiento en unos instantes.',
        );
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la versión',
          mensajeErrorEliminarVersion(err, 'No se pudo eliminar la versión.'),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo={`¿Eliminar la versión ${version.numeroVersion} de «${version.nombreDocumento}»?`}
      descripcion="Dejará de ofrecerse a los asesores y no se podrá descargar."
      consecuencias={[
        'Se elimina de forma definitiva: no se puede deshacer.',
        'Si algún artefacto ya usa esta versión, no se podrá eliminar.',
      ]}
      labelConfirmar="Eliminar versión"
      variante="peligro"
      cargando={eliminar.isPending}
      onConfirmar={confirmarEliminacion}
      onCancelar={onCerrar}
    />
  );
}
