import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionCualitativasJuradoContenido from './components/jurado/GestionCualitativasJuradoContenido';
import GestionEvaluacionMarco from './components/GestionEvaluacionMarco';
import { useEvaluacionAsignadaJurado } from './hooks/useEvaluacionAsignadaJurado';

const ROLES_GESTIONAN = [Rol.Jurado];

export default function GestionarEvaluacionesCualitativasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_GESTIONAN);

  if (!esJurado) return <AccesoDenegado />;

  return (
    <GestionEvaluacionMarco
      titulo="Gestionar evaluaciones cualitativas"
      asignacionId={evaluacionJuradoId}
      usarAsignacion={useEvaluacionAsignadaJurado}
    >
      {(asignacion, onVolver) => (
        <GestionCualitativasJuradoContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionEvaluacionMarco>
  );
}
