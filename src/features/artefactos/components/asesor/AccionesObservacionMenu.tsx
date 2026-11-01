import { LockKeyhole, RotateCcw, Trash2 } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
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
  const resumen = resumir(observacion.descripcion);
  if (modo === 'eliminar') {
    return (
      <IconButton
        tono="peligro"
        icono={Trash2}
        etiqueta={`Eliminar observación: ${resumen}`}
        onClick={() => onEliminar(observacion)}
      />
    );
  }
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
