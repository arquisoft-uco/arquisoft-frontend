import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import AsesorView from './components/AsesorView';
import EstudianteView from './components/EstudianteView';
import JuradoView from './components/JuradoView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Asesor]: AsesorView,
  [Rol.Estudiante]: EstudianteView,
  [Rol.Jurado]: JuradoView,
};

export default function Entregables() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
