import { Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import IconButton from '../../../../shared/components/ui/IconButton';
import { useEvaluacionesEstudiante } from '../../hooks/useEvaluacionesEstudiante';
import type { Evaluacion } from '../../models/Evaluacion';
import type { NavegacionJuradosEvaluacion } from '../../models/ResumenEvaluacion';
import ListadoEvaluaciones from '../ListadoEvaluaciones';

export default function ConsultarEvaluacionesEstudiante() {
  const listado = useEvaluacionesEstudiante();
  const navigate = useNavigate();
  const { search } = useLocation();

  function verJurados(evaluacion: Evaluacion) {
    const state: NavegacionJuradosEvaluacion = {
      resumen: {
        id: evaluacion.id,
        proyecto: evaluacion.entregable.proyecto,
        version: evaluacion.entregable.version,
      },
      search,
    };
    navigate(`/evaluaciones/${evaluacion.id}/jurados`, { state });
  }

  return (
    <ListadoEvaluaciones
      listado={listado}
      encabezadoAcciones="Acciones"
      acciones={(evaluacion) => (
        <IconButton
          etiqueta={`Ver evaluaciones del jurado de ${evaluacion.entregable.proyecto}`}
          icono={Users}
          tono="primario"
          rotulo="Ver evaluaciones del jurado"
          onClick={() => verJurados(evaluacion)}
        />
      )}
      descripcionVacio="Aparecerán aquí cuando se registren evaluaciones de los entregables de tu proyecto de grado."
    />
  );
}
