import { UserCheck, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useEvaluacionesEstudiante } from '../../hooks/useEvaluacionesEstudiante';
import type { Evaluacion } from '../../models/Evaluacion';
import type { NavegacionJuradosEvaluacion } from '../../models/ResumenEvaluacion';
import ListadoEvaluaciones from '../ListadoEvaluaciones';

export default function ConsultarEvaluacionesEstudiante() {
  const listado = useEvaluacionesEstudiante();
  const navigate = useNavigate();
  const { search } = useLocation();

  function estadoDeNavegacion(evaluacion: Evaluacion): NavegacionJuradosEvaluacion {
    return {
      resumen: {
        id: evaluacion.id,
        proyecto: evaluacion.entregable.proyecto,
        version: evaluacion.entregable.version,
      },
      search,
    };
  }

  function verJurados(evaluacion: Evaluacion) {
    navigate(`/evaluaciones/${evaluacion.id}/jurados`, { state: estadoDeNavegacion(evaluacion) });
  }

  function verAsesor(evaluacion: Evaluacion) {
    navigate(`/evaluaciones/${evaluacion.id}/asesor`, { state: estadoDeNavegacion(evaluacion) });
  }

  return (
    <ListadoEvaluaciones
      listado={listado}
      encabezadoAcciones="Acciones"
      acciones={(evaluacion) => (
        <RowMenu
          etiqueta={`Acciones de ${evaluacion.entregable.proyecto}`}
          acciones={[
            {
              etiqueta: 'Ver evaluaciones del jurado',
              icono: Users,
              onSeleccionar: () => verJurados(evaluacion),
            },
            {
              etiqueta: 'Ver evaluación del asesor',
              icono: UserCheck,
              onSeleccionar: () => verAsesor(evaluacion),
            },
          ]}
        />
      )}
      descripcionVacio="Aparecerán aquí cuando se registren evaluaciones de los entregables de tu proyecto de grado."
    />
  );
}
