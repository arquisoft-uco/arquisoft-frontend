import Button from '../../../../shared/components/ui/Button';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';

interface Props {
  observacion: ObservacionItemJurado;
  conVarias: boolean;
  onModificar?: (observacion: ObservacionItemJurado) => void;
  onRemover?: (observacion: ObservacionItemJurado) => void;
}

export default function AccionesObservacionItemJurado({
  observacion,
  conVarias,
  onModificar,
  onRemover,
}: Props) {
  const sufijo = conVarias ? `: ${observacion.descripcion}` : undefined;

  return (
    <div className="acciones-fila flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      {onModificar && (
        <Button
          variante="secundario"
          aria-label={sufijo && `Modificar observación${sufijo}`}
          onClick={() => onModificar(observacion)}
        >
          Modificar observación
        </Button>
      )}
      {onRemover && (
        <Button
          variante="peligroContorno"
          aria-label={sufijo && `Remover observación${sufijo}`}
          onClick={() => onRemover(observacion)}
        >
          Remover observación
        </Button>
      )}
    </div>
  );
}
