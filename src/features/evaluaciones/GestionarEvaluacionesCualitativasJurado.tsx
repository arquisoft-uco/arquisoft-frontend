import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionCualitativasJuradoContenido from './components/jurado/GestionCualitativasJuradoContenido';
import GestionJuradoMarco from './components/jurado/GestionJuradoMarco';

const ROLES_GESTIONAN = [Rol.Jurado];

export default function GestionarEvaluacionesCualitativasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_GESTIONAN);

  if (!esJurado) return <AccesoDenegado />;

  return (
    <GestionJuradoMarco
      titulo="Gestionar evaluaciones cualitativas"
      evaluacionJuradoId={evaluacionJuradoId}
    >
      {(asignacion, onVolver) => (
        <GestionCualitativasJuradoContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionJuradoMarco>
  );
}
