import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEliminarUsuario } from '../../hooks/useEliminarUsuario';
import type { Usuario } from '../../models/Usuario';

const CONSECUENCIAS: string[] = [
  'Solo se puede dar de baja a quien ya no tiene roles vigentes.',
  'Podrás restaurar al usuario desde la pestaña Acceso.',
];

interface Props {
  usuario: Usuario;
  onCerrar: () => void;
  onBajaExitosa?: () => void;
}

export default function DarDeBajaUsuarioDialog({ usuario, onCerrar, onBajaExitosa }: Props) {
  const eliminar = useEliminarUsuario();
  const { id, nombre } = usuario;

  function confirmar() {
    eliminar.mutate(id, {
      onSuccess: () => {
        toast.success('Usuario dado de baja', `${nombre} ya no está vigente.`);
        onBajaExitosa?.();
      },
      onError: (err) =>
        toast.error(
          'No se pudo dar de baja al usuario',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        ),
      onSettled: () => onCerrar(),
    });
  }

  function cancelar() {
    if (!eliminar.isPending) onCerrar();
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo={`¿Dar de baja a ${nombre}?`}
      descripcion={`Se desactivará el acceso de ${nombre} y dejará de estar vigente.`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Dar de baja"
      cargando={eliminar.isPending}
      onConfirmar={confirmar}
      onCancelar={cancelar}
    />
  );
}
