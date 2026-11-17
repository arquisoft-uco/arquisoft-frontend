import { Navigate } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import AsesorView from './components/AsesorView';
import CoordinadorView from './components/CoordinadorView';
import EstudianteView from './components/EstudianteView';
import ItemsAdministradorView from './components/ItemsAdministradorView';
import JuradoView from './components/JuradoView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Administrador]: ItemsAdministradorView,
  [Rol.Asesor]: AsesorView,
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Estudiante]: EstudianteView,
  [Rol.Jurado]: JuradoView,
};

export default function Evaluaciones() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <AccesoDenegado />;

  return <View />;
}
