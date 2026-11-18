import { Pencil, Trash2 } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';

interface Props {
  observacion: ObservacionItemAsesor;
  conVarias: boolean;
  onModificar?: (observacion: ObservacionItemAsesor) => void;
  onRemover?: (observacion: ObservacionItemAsesor) => void;
}

export default function AccionesObservacionItemAsesor({
  observacion,
  conVarias,
  onModificar,
  onRemover,
}: Props) {
  const sufijo = conVarias ? `: ${observacion.descripcion}` : '';

  return (
    <>
      {onModificar && (
        <IconButton
          etiqueta={`Modificar observación${sufijo}`}
          icono={Pencil}
          rotulo="Modificar observación"
          onClick={() => onModificar(observacion)}
        />
      )}
      {onRemover && (
        <IconButton
          etiqueta={`Remover observación${sufijo}`}
          icono={Trash2}
          tono="peligro"
          rotulo="Remover observación"
          onClick={() => onRemover(observacion)}
        />
      )}
    </>
  );
}
