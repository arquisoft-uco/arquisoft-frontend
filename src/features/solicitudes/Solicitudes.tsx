import { Navigate } from 'react-router';
import { ClipboardList } from 'lucide-react';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import ComingSoon from '../../shared/components/ComingSoon';
import EstudianteView from './components/EstudianteView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Estudiante]: EstudianteView,
};

export default function Solicitudes() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) {
    return (
      <ComingSoon
        title="Solicitudes"
        description="Gestión de trámites y solicitudes institucionales"
        icon={ClipboardList}
      />
    );
  }

  return <View />;
}
