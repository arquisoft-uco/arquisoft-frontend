import { Navigate } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import EntregablesDisponiblesView from './components/EntregablesDisponiblesView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Bibliotecario]: EntregablesDisponiblesView,
};

export default function BibliotecaDisponibles() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <AccesoDenegado />;

  return <View />;
}
