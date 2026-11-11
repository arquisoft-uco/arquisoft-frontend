import { useParams } from 'react-router';
import { useHistorialEstadosProyectoGrado } from '../hooks/useHistorialEstadosProyectoGrado';
import HistorialEstadosProyectoVista from './HistorialEstadosProyectoVista';

export default function PestanaEstados() {
  const { id = '' } = useParams();
  const consulta = useHistorialEstadosProyectoGrado(id);
  return <HistorialEstadosProyectoVista consulta={consulta} />;
}
