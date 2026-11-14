import { Calculator, ClipboardList, ClipboardPen, ListChecks } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import type { NavegacionCualitativasRealizadasJurado } from '../../models/NavegacionCualitativasRealizadasJurado';
import type { NavegacionCuantitativasRealizadasJurado } from '../../models/NavegacionCuantitativasRealizadasJurado';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';

const ACCIONES = 'flex items-center gap-1';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
}

export default function AccionesEvaluacionAsignadaJurado({ asignacion }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const finalizada = asignacion.evaluacion.estado.id === ESTADO_FINALIZADA;
  const proyecto = asignacion.entregable.proyecto;

  function verRealizadas(ruta: string) {
    const state: NavegacionCualitativasRealizadasJurado & NavegacionCuantitativasRealizadasJurado =
      {
        evaluacionJuradoId: asignacion.id,
        search: location.search,
        evaluacionFinalizada: finalizada,
        resumen: { proyecto, version: asignacion.entregable.version },
      };
    navigate(`/evaluaciones/${asignacion.id}/${ruta}`, { state });
  }

  return (
    <div className={ACCIONES}>
      {asignacion.tieneEvaluacionesCualitativas && (
        <IconButton
          etiqueta={`Ver cualitativas de ${proyecto}`}
          icono={ClipboardList}
          tono="neutro"
          rotulo="Ver cualitativas"
          onClick={() => verRealizadas('cualitativas-realizadas')}
        />
      )}
      <IconButton
        etiqueta={`Evaluar ${proyecto}`}
        icono={ClipboardPen}
        tono="primario"
        rotulo="Evaluar"
        disabled={finalizada}
        onClick={() => navigate(`/evaluaciones/${asignacion.id}/evaluar`)}
      />
      {asignacion.tieneEvaluacionesCuantitativas && (
        <IconButton
          etiqueta={`Ver cuantitativas de ${proyecto}`}
          icono={ListChecks}
          tono="neutro"
          rotulo="Ver cuantitativas"
          onClick={() => verRealizadas('cuantitativas-realizadas')}
        />
      )}
      <IconButton
        etiqueta={`Evaluar cuantitativas de ${proyecto}`}
        icono={Calculator}
        tono="primario"
        rotulo="Evaluar cuantitativas"
        disabled={finalizada}
        onClick={() => navigate(`/evaluaciones/${asignacion.id}/evaluar-cuantitativas`)}
      />
    </div>
  );
}
