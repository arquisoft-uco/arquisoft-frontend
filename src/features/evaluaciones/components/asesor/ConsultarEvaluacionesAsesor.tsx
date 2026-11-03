import { useEvaluacionesAsesor } from '../../hooks/useEvaluacionesAsesor';
import ListadoEvaluaciones from '../ListadoEvaluaciones';

export default function ConsultarEvaluacionesAsesor() {
  const listado = useEvaluacionesAsesor();

  return (
    <ListadoEvaluaciones
      listado={listado}
      descripcionVacio="Aparecerán aquí cuando se te asocien entregables."
    />
  );
}
