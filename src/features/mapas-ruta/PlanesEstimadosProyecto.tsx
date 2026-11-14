import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import PlanesEstimadosProyectoAsesorView from './components/PlanesEstimadosProyectoAsesorView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Asesor]: PlanesEstimadosProyectoAsesorView,
};

export default function PlanesEstimadosProyecto() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
