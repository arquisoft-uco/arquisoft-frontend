import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionCuantitativasJuradoContenido from './components/jurado/GestionCuantitativasJuradoContenido';
import GestionJuradoMarco from './components/jurado/GestionJuradoMarco';

const ROLES_GESTIONAN = [Rol.Jurado];

export default function GestionarEvaluacionesCuantitativasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_GESTIONAN);

  if (!esJurado) return <AccesoDenegado />;

  return (
    <GestionJuradoMarco
      titulo="Gestionar evaluaciones cuantitativas"
      evaluacionJuradoId={evaluacionJuradoId}
    >
      {(asignacion, onVolver) => (
        <GestionCuantitativasJuradoContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionJuradoMarco>
  );
}
