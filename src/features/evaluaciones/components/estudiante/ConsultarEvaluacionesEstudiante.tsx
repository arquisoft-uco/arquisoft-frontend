import { useEvaluacionesEstudiante } from '../../hooks/useEvaluacionesEstudiante';
import ListadoEvaluaciones from '../ListadoEvaluaciones';

export default function ConsultarEvaluacionesEstudiante() {
  const listado = useEvaluacionesEstudiante();

  return (
    <ListadoEvaluaciones
      listado={listado}
      descripcionVacio="Aparecerán aquí cuando se registren evaluaciones de los entregables de tu proyecto de grado."
    />
  );
}
