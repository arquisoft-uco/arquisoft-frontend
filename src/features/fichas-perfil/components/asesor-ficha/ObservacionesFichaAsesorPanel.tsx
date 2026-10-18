import { useState } from 'react';
import { Pencil } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import type { ObservacionItem } from '../../models/ObservacionItem';
import ObservacionesFichaTabla from '../ObservacionesFichaTabla';
import EditarObservacionItemPanel from './EditarObservacionItemPanel';

interface Props {
  fichaPerfilId: string;
}

export default function ObservacionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const observaciones = useObservacionesFichaAsesor(fichaPerfilId);
  const [enEdicion, setEnEdicion] = useState<{
    observacion: ObservacionItem;
    nombreItem: string;
  } | null>(null);

  return (
    <>
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
    </>
  );
}
