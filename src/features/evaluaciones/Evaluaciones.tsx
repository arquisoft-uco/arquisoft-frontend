import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import CoordinadorView from './components/CoordinadorView';
import EstudianteView from './components/EstudianteView';
import ItemsJuradoView from './components/ItemsJuradoView';
import JuradoView from './components/JuradoView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Administrador]: ItemsJuradoView,
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Estudiante]: EstudianteView,
  [Rol.Jurado]: JuradoView,
};

export default function Evaluaciones() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
