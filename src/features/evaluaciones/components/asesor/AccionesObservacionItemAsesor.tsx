import { Pencil } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';

interface Props {
  observacion: ObservacionItemAsesor;
  conVarias: boolean;
  onModificar: (observacion: ObservacionItemAsesor) => void;
}

export default function AccionesObservacionItemAsesor({
  observacion,
  conVarias,
  onModificar,
}: Props) {
  return (
    <IconButton
      etiqueta={
        conVarias ? `Modificar observación: ${observacion.descripcion}` : 'Modificar observación'
      }
      icono={Pencil}
      rotulo="Modificar observación"
      onClick={() => onModificar(observacion)}
    />
  );
}
