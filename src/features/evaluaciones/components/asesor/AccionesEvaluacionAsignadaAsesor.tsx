import { ClipboardList, ClipboardPen, ListChecks } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import type { NavegacionCualitativasAsesor } from '../../models/NavegacionCualitativasAsesor';
import type { NavegacionCuantitativasAsesor } from '../../models/NavegacionCuantitativasAsesor';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';

const ACCIONES = 'flex items-center gap-1';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
}

export default function AccionesEvaluacionAsignadaAsesor({ asignacion }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const finalizada = asignacion.evaluacion.estado.id === ESTADO_FINALIZADA;
  const proyecto = asignacion.entregable.proyecto;

  function navegarA(ruta: string) {
    const state: NavegacionCualitativasAsesor & NavegacionCuantitativasAsesor = {
      evaluacionAsesorId: asignacion.id,
      search: location.search,
      resumen: { proyecto, version: asignacion.entregable.version },
    };
    navigate(`/evaluaciones/${asignacion.id}/${ruta}`, { state });
  }

  function verCualitativas() {
    navegarA('cualitativas-asesor');
  }

  function evaluar() {
    navegarA('evaluar-asesor');
  }

  function verCuantitativas() {
    navegarA('cuantitativas-asesor');
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
      <IconButton
        etiqueta={`Evaluar ${proyecto}`}
        icono={ClipboardPen}
        tono="primario"
        rotulo="Evaluar"
        disabled={finalizada}
        onClick={evaluar}
      />
      {asignacion.tieneEvaluacionesCuantitativas && (
        <IconButton
          etiqueta={`Ver cuantitativas de ${proyecto}`}
          icono={ListChecks}
          tono="neutro"
          rotulo="Ver cuantitativas"
          onClick={verCuantitativas}
        />
      )}
    </div>
  );
}
