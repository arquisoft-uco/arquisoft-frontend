import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import AdministradorView from './components/AdministradorView';
import AsesorView from './components/AsesorView';
import CoordinadorView from './components/CoordinadorView';
import EstudianteView from './components/EstudianteView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Estudiante]: EstudianteView,
  [Rol.Coordinador]: CoordinadorView,
  [Rol.Asesor]: AsesorView,
  [Rol.Administrador]: AdministradorView,
};

export default function Solicitudes() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <AccesoDenegado />;

  return <View />;
}
