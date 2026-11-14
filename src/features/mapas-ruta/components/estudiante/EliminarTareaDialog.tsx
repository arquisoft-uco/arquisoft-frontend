import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarTarea } from '../../hooks/useEliminarTarea';
import type { Tarea } from '../../models/Tarea';
import { mensajeErrorEliminarTarea } from '../../utils/errores-mapa-ruta';

const CONSECUENCIAS = [
  'Se elimina de forma definitiva: no se puede deshacer.',
  'Dejará de aparecer en tu mapa de ruta.',
];

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
  onEliminada: () => void;
}

export default function EliminarTareaDialog({ tarea, onCerrar, onEliminada }: Props) {
  const mutacion = useEliminarTarea();

  function confirmar() {
    mutacion.mutate(tarea.id, {
      onSuccess: () => {
        toast.success('Tarea eliminada');
        onEliminada();
      },
      onError: (err) => {
        toast.error('No se pudo eliminar la tarea', mensajeErrorEliminarTarea(err));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo={`¿Eliminar la tarea «${tarea.descripcion}»?`}
      descripcion={`Está en estado «${tarea.estado.nombre}» y a cargo de ${tarea.asesor.nombre}.`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Eliminar tarea"
      variante="peligro"
      cargando={mutacion.isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
