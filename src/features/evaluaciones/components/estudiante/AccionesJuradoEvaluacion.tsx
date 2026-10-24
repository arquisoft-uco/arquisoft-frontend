import Button from '../../../../shared/components/ui/Button';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

interface Props {
  jurado: EvaluacionJurado;
  onVerCualitativa: (jurado: EvaluacionJurado) => void;
}

export default function AccionesJuradoEvaluacion({ jurado, onVerCualitativa }: Props) {
  const nombre = jurado.jurado.nombre;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <Button
        tamano="sm"
        variante="secundario"
        aria-label={`Ver evaluación cualitativa de ${nombre}`}
        onClick={() => onVerCualitativa(jurado)}
      >
        Ver evaluación cualitativa
      </Button>
      <Button
        tamano="sm"
        variante="secundario"
        disabled
        title="Próximamente"
        aria-label={`Ver evaluación cuantitativa de ${nombre} (próximamente)`}
      >
        Ver evaluación cuantitativa
      </Button>
    </div>
  );
}
