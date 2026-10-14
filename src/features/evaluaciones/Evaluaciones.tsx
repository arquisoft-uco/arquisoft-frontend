import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import CoordinadorView from './components/CoordinadorView';
import ItemsJuradoView from './components/ItemsJuradoView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Administrador]: ItemsJuradoView,
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Jurado]: ItemsJuradoView,
};

export default function Evaluaciones() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
