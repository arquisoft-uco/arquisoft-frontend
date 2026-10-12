import { Navigate, useParams } from 'react-router';
import AsesoresProyectoGradoPanel from './coordinador/AsesoresProyectoGradoPanel';

export default function PestanaAsesores() {
  const { id } = useParams();

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  return <AsesoresProyectoGradoPanel proyectoGradoId={id} />;
}
