import { useParams } from 'react-router';
import { useDetalleProyectoGradoAsesor } from '../../hooks/useDetalleProyectoGradoAsesor';
import { aResumen } from '../../utils/resumen-proyecto-grado';
import ResumenProyectoGradoPanel from '../ResumenProyectoGradoPanel';
import EstudiantesAsesoradosResumen from './EstudiantesAsesoradosResumen';

export default function PestanaResumenAsesor() {
  const { id = '' } = useParams();
  const { data: proyecto } = useDetalleProyectoGradoAsesor(id);

  if (!proyecto) return null;

  return (
    <ResumenProyectoGradoPanel
      resumen={aResumen(proyecto)}
      estudiantes={<EstudiantesAsesoradosResumen proyectoGradoId={proyecto.id} />}
    />
  );
}
