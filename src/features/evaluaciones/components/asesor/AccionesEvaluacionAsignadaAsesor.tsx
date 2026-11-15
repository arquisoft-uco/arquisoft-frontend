import { ClipboardList } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import type { NavegacionCualitativasAsesor } from '../../models/NavegacionCualitativasAsesor';

const ACCIONES = 'flex items-center gap-1';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
}

export default function AccionesEvaluacionAsignadaAsesor({ asignacion }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const proyecto = asignacion.entregable.proyecto;

  function verCualitativas() {
    const state: NavegacionCualitativasAsesor = {
      evaluacionAsesorId: asignacion.id,
      search: location.search,
      resumen: { proyecto, version: asignacion.entregable.version },
    };
    navigate(`/evaluaciones/${asignacion.id}/cualitativas-asesor`, { state });
  }

  return (
    <div className={ACCIONES}>
      {asignacion.tieneEvaluacionesCualitativas && (
        <IconButton
          etiqueta={`Ver cualitativas de ${proyecto}`}
          icono={ClipboardList}
          tono="neutro"
          rotulo="Ver cualitativas"
          onClick={verCualitativas}
        />
      )}
    </div>
  );
}
