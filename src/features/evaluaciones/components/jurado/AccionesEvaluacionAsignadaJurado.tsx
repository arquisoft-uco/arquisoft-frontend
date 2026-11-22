import { Calculator, ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import Button from '../../../../shared/components/ui/Button';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

const ACCIONES = 'flex flex-col items-stretch gap-2 md:flex-row md:items-center md:justify-end';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
}

export default function AccionesEvaluacionAsignadaJurado({ asignacion }: Props) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const proyecto = asignacion.entregable.proyecto;

  function gestionar(ruta: string) {
    navigate(`/evaluaciones/${asignacion.id}/${ruta}${search}`);
  }

  return (
    <div className={ACCIONES}>
      <Button
        variante="secundario"
        tamano="sm"
        icono={ClipboardList}
        aria-label={`Gestionar cualitativas de ${proyecto}`}
        onClick={() => gestionar('gestionar-cualitativas')}
      >
        Gestionar cualitativas
      </Button>
      <Button
        variante="secundario"
        tamano="sm"
        icono={Calculator}
        aria-label={`Gestionar cuantitativas de ${proyecto}`}
        onClick={() => gestionar('gestionar-cuantitativas')}
      >
        Gestionar cuantitativas
      </Button>
    </div>
  );
}
