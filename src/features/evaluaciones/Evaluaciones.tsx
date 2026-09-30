import { ClipboardCheck } from 'lucide-react';
import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import ComingSoon from '../../shared/components/ComingSoon';
import { Rol } from '../../shared/models/rol';
import ItemsCualitativosJuradoView from './components/ItemsCualitativosJuradoView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Administrador]: ItemsCualitativosJuradoView,
  [Rol.Jurado]: ItemsCualitativosJuradoView,
};

export default function Evaluaciones() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) {
    return (
      <ComingSoon
        title="Evaluaciones"
        description="Calificar y revisar el desempeño de proyectos académicos"
        icon={ClipboardCheck}
      />
    );
  }

  return <View />;
}
