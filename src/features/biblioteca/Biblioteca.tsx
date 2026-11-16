import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import BibliotecaView from './components/BibliotecaView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Asesor]: BibliotecaView,
  [Rol.Bibliotecario]: BibliotecaView,
  [Rol.Coordinador]: BibliotecaView,
  [Rol.Estudiante]: BibliotecaView,
};

export default function Biblioteca() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
