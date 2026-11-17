import { Navigate } from 'react-router';
import { useRolActivo } from '../../hooks/useAuth';
import { Rol } from '../../shared/models/rol';
import JuradosEvaluacionCoordinadorView from './components/coordinador/JuradosEvaluacionCoordinadorView';
import JuradosEvaluacionEstudianteView from './components/estudiante/JuradosEvaluacionEstudianteView';

const VIEW_POR_ROL: Record<string, React.ComponentType> = {
  [Rol.Estudiante]: JuradosEvaluacionEstudianteView,
  [Rol.Coordinador]: JuradosEvaluacionCoordinadorView,
};

export default function JuradosEvaluacion() {
  const rolActivo = useRolActivo();

  if (!rolActivo) return <Navigate to="/seleccionar-rol" replace />;

  const View = VIEW_POR_ROL[rolActivo];

  if (!View) return <Navigate to="/forbidden" replace />;

  return <View />;
}
