import { LockKeyhole, RotateCcw, Trash2 } from 'lucide-react';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { ObservacionRevision } from '../../models/ObservacionRevision';

const LONGITUD_ETIQUETA = 40;

function resumir(texto: string) {
  return texto.length > LONGITUD_ETIQUETA ? `${texto.slice(0, LONGITUD_ETIQUETA)}…` : texto;
}

interface Props {
  observacion: ObservacionRevision;
  modo: 'eliminar' | 'decidir';
  puedeReabrir: boolean;
  onEliminar: (observacion: ObservacionRevision) => void;
  onDecidir: (observacion: ObservacionRevision, estado: 'CERRADA' | 'REABIERTA') => void;
}

export default function AccionesObservacionMenu({
  observacion,
  modo,
  puedeReabrir,
  onEliminar,
  onDecidir,
}: Props) {
  if (modo === 'eliminar') {
    return (
      <RowMenu
        etiqueta="Acciones de la observación"
        acciones={[
          {
            etiqueta: 'Eliminar observación',
            icono: Trash2,
            peligro: true,
            onSeleccionar: () => onEliminar(observacion),
          },
        ]}
      />
    );
  }
  const resumen = resumir(observacion.descripcion);
  return (
    <RowMenu
      etiqueta={`Acciones de la observación: ${resumen}`}
      acciones={[
        {
          etiqueta: 'Cerrar observación',
          icono: LockKeyhole,
          onSeleccionar: () => onDecidir(observacion, 'CERRADA'),
        },
        {
          etiqueta: 'Reabrir observación',
          icono: RotateCcw,
          onSeleccionar: () => onDecidir(observacion, 'REABIERTA'),
          deshabilitada: !puedeReabrir,
        },
      ]}
    />
  );
}
