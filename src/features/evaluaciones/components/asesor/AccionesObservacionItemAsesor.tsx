import Button from '../../../../shared/components/ui/Button';
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
    <Button
      type="button"
      variante="secundario"
      aria-label={conVarias ? `Modificar observación: ${observacion.descripcion}` : undefined}
      onClick={() => onModificar(observacion)}
    >
      Modificar observación
    </Button>
  );
}
