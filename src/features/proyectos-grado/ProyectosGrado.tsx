import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import CoordinadorView from './components/CoordinadorView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Coordinador]: CoordinadorView,
};

export default function ProyectosGrado() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
