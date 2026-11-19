import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useCerrarObservacionItem } from '../../hooks/useCerrarObservacionItem';
import { mensajeErrorObservacionItem } from '../../utils/errores-observacion-item';

interface Props {
  observacionId: string;
  fichaPerfilId: string;
  onCerrar: () => void;
}

export default function CerrarObservacionItemDialog({
  observacionId,
  fichaPerfilId,
  onCerrar,
}: Props) {
  const cerrar = useCerrarObservacionItem(fichaPerfilId);

  function confirmar() {
    cerrar.mutate(observacionId, {
      onSuccess: () => {
        toast.success('Observación cerrada');
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo cerrar la observación',
          mensajeErrorObservacionItem(err, 'No se pudo cerrar la observación.'),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo="¿Cerrar esta observación?"
      consecuencias={[
        'La observación queda cerrada.',
        'Si era la última sin cerrar, la revisión también se cierra y se avisa por correo a los estudiantes de la ficha.',
      ]}
      labelConfirmar="Cerrar observación"
      variante="advertencia"
      cargando={cerrar.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
