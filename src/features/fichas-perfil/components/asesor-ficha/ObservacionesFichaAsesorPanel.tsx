import { useState } from 'react';
import { LockKeyhole, LockKeyholeOpen, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Notice from '../../../../shared/components/ui/Notice';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { toast } from '../../../../shared/hooks/useToast';
import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import { useRemoverObservacionItem } from '../../hooks/useRemoverObservacionItem';
import type { ObservacionItem } from '../../models/ObservacionItem';
import { ESTADO_OBSERVACION_CERRADO, puedeCerrar } from '../../utils/estado-revision';
import { mensajeErrorObservacionItem } from '../../utils/errores-observacion-item';
import ObservacionesFichaTabla from '../ObservacionesFichaTabla';
import CerrarObservacionItemDialog from './CerrarObservacionItemDialog';
import EditarObservacionItemPanel from './EditarObservacionItemPanel';
import ReabrirObservacionItemDialog from './ReabrirObservacionItemDialog';

interface Props {
  fichaPerfilId: string;
}

export default function ObservacionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const observaciones = useObservacionesFichaAsesor(fichaPerfilId);
  const remover = useRemoverObservacionItem(fichaPerfilId);
  const [observacionARemover, setObservacionARemover] = useState<string | null>(null);
  const [observacionACerrar, setObservacionACerrar] = useState<string | null>(null);
  const [observacionAReabrir, setObservacionAReabrir] = useState<string | null>(null);
  const [enEdicion, setEnEdicion] = useState<{
    observacion: ObservacionItem;
    nombreItem: string;
  } | null>(null);

  function confirmarRemover() {
    if (!observacionARemover) return;
    remover.mutate(observacionARemover, {
      onSuccess: () => {
        toast.success('Observación removida');
        setObservacionARemover(null);
        if (observaciones.page > 0 && observaciones.filas.length === 1) {
          observaciones.goToPage(observaciones.page - 1);
        }
      },
      onError: (err) => {
        toast.error(
          'No se pudo remover la observación',
          mensajeErrorObservacionItem(err, 'No se pudo remover la observación.'),
        );
        setObservacionARemover(null);
      },
    });
  }

  const hayCierreNoDisponible = observaciones.filas.some(
    (fila) =>
      !fila.revisionCerrada &&
      fila.observacion.estadoId !== ESTADO_OBSERVACION_CERRADO &&
      !puedeCerrar(fila),
  );

  return (
    <div className="space-y-4">
      {hayCierreNoDisponible && (
        <Notice variante="info">
          Puedes cerrar una observación cuando el estudiante envíe las correcciones de su revisión y
          la observación esté en progreso.
        </Notice>
      )}
      <ObservacionesFichaTabla
        {...observaciones}
        tituloVacio="Esta ficha aún no tiene observaciones"
        descripcionVacia="Cuando agregues una observación a una revisión, la verás aquí."
        acciones={(fila) => {
          if (fila.revisionCerrada) return null;
          const nombreItem = fila.item?.tipoItem.nombre ?? 'un ítem';
          return (
            <RowMenu
              etiqueta={`Acciones de la observación de ${nombreItem}`}
              acciones={[
                {
                  etiqueta: 'Editar observación',
                  icono: Pencil,
                  onSeleccionar: () => setEnEdicion({ observacion: fila.observacion, nombreItem }),
                },
                fila.observacion.estadoId === ESTADO_OBSERVACION_CERRADO
                  ? {
                      etiqueta: 'Reabrir observación',
                      icono: LockKeyholeOpen,
                      onSeleccionar: () => setObservacionAReabrir(fila.observacion.id),
                    }
                  : {
                      etiqueta: 'Cerrar observación',
                      icono: LockKeyhole,
                      deshabilitada: !puedeCerrar(fila),
                      onSeleccionar: () => setObservacionACerrar(fila.observacion.id),
                    },
                {
                  etiqueta: 'Remover observación',
                  icono: Trash2,
                  peligro: true,
                  deshabilitada: remover.isPending && remover.variables === fila.observacion.id,
                  onSeleccionar: () => setObservacionARemover(fila.observacion.id),
                },
              ]}
            />
          );
        }}
      />
      {enEdicion && (
        <EditarObservacionItemPanel
          key={enEdicion.observacion.id}
          observacion={enEdicion.observacion}
          fichaPerfilId={fichaPerfilId}
          nombreItem={enEdicion.nombreItem}
          onCerrar={() => setEnEdicion(null)}
        />
      )}
      {observacionACerrar && (
        <CerrarObservacionItemDialog
          observacionId={observacionACerrar}
          fichaPerfilId={fichaPerfilId}
          onCerrar={() => setObservacionACerrar(null)}
        />
      )}
      {observacionAReabrir && (
        <ReabrirObservacionItemDialog
          observacionId={observacionAReabrir}
          fichaPerfilId={fichaPerfilId}
          onCerrar={() => setObservacionAReabrir(null)}
        />
      )}
      {observacionARemover && (
        <ConfirmDialog
          titulo="¿Remover esta observación?"
          descripcion="La observación dejará de aparecer en la ficha."
          consecuencias={['Se borra de forma definitiva: no se puede deshacer.']}
          labelConfirmar="Remover observación"
          variante="peligro"
          cargando={remover.isPending}
          onConfirmar={confirmarRemover}
          onCancelar={() => setObservacionARemover(null)}
        />
      )}
    </div>
  );
}
