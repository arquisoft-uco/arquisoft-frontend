import { useEstadosProyectoGrado } from '../../hooks/useEstadosProyectoGrado';
import HistorialEstadosProyectoVista from '../HistorialEstadosProyectoVista';

interface Props {
  proyectoGradoId: string;
}

export default function HistorialEstadosProyectoPanel({ proyectoGradoId }: Props) {
  const consulta = useEstadosProyectoGrado(proyectoGradoId);
  return <HistorialEstadosProyectoVista consulta={consulta} />;
}
