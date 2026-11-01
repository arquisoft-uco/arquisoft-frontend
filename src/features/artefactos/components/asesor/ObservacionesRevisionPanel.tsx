import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { toast } from '../../../../shared/hooks/useToast';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { mensajeErrorEliminarObservacion } from '../../utils/errores-eliminar-observacion';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';

interface Props {
  revisionAsesorId: string;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanel({ revisionAsesorId, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevision(revisionAsesorId);
  const eliminar = useEliminarObservacion();
  const [observacionAEliminar, setObservacionAEliminar] = useState<string | null>(null);

  function confirmarEliminacion() {
    if (!observacionAEliminar) return;
    eliminar.mutate(observacionAEliminar, {
      onSuccess: () => {
        toast.success('Observación eliminada');
        setObservacionAEliminar(null);
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la observación',
          mensajeErrorEliminarObservacion(err, 'No se pudo eliminar la observación.'),
        );
        setObservacionAEliminar(null);
      },
    });
  }

  return (
    <>
      <ObservacionesRevisionPanelBase
        descripcion="Lo que registraste en esta revisión."
        descripcionVacia="Aún no hay observaciones registradas en esta revisión."
        observaciones={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReintentar={() => void refetch()}
        onCerrar={onCerrar}
        acciones={(observacion) => (
          <RowMenu
            etiqueta="Acciones de la observación"
            acciones={[
              {
                etiqueta: 'Eliminar observación',
                icono: Trash2,
                peligro: true,
                deshabilitada: eliminar.isPending && eliminar.variables === observacion.id,
                onSeleccionar: () => setObservacionAEliminar(observacion.id),
              },
            ]}
          />
        )}
      />
      {observacionAEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar esta observación?"
          descripcion="La observación dejará de aparecer en la revisión."
          consecuencias={['Se borra de forma definitiva: no se puede deshacer.']}
          labelConfirmar="Eliminar observación"
          variante="peligro"
          cargando={eliminar.isPending}
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setObservacionAEliminar(null)}
        />
      )}
    </>
  );
}
