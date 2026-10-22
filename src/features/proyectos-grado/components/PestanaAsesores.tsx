import { Navigate, useOutletContext, useParams } from 'react-router';
import type { ContextoDetalleProyectoGrado } from '../models/ContextoDetalleProyectoGrado';
import AsesoresProyectoGradoPanel from './coordinador/AsesoresProyectoGradoPanel';

export default function PestanaAsesores() {
  const { id } = useParams();
  const contexto = useOutletContext<ContextoDetalleProyectoGrado | undefined>();

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  return (
    <AsesoresProyectoGradoPanel
      proyectoGradoId={id}
      titulo={contexto?.titulo ?? 'Proyecto de grado'}
      finalizado={contexto?.finalizado ?? false}
    />
  );
}
