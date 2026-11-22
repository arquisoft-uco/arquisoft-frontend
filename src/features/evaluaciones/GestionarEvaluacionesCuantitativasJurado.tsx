import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionCuantitativasJuradoContenido from './components/jurado/GestionCuantitativasJuradoContenido';
import GestionEvaluacionMarco from './components/GestionEvaluacionMarco';
import { useEvaluacionAsignadaJurado } from './hooks/useEvaluacionAsignadaJurado';

const ROLES_GESTIONAN = [Rol.Jurado];

export default function GestionarEvaluacionesCuantitativasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_GESTIONAN);

  if (!esJurado) return <AccesoDenegado />;

  return (
    <GestionEvaluacionMarco
      titulo="Gestionar evaluaciones cuantitativas"
      asignacionId={evaluacionJuradoId}
      usarAsignacion={useEvaluacionAsignadaJurado}
    >
      {(asignacion, onVolver) => (
        <GestionCuantitativasJuradoContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionEvaluacionMarco>
  );
}
