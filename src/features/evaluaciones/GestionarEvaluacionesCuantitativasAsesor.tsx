import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionEvaluacionMarco from './components/GestionEvaluacionMarco';
import GestionCuantitativasAsesorContenido from './components/asesor/GestionCuantitativasAsesorContenido';
import { useEvaluacionAsignadaAsesor } from './hooks/useEvaluacionAsignadaAsesor';

const ROLES_GESTIONAN = [Rol.Asesor];

export default function GestionarEvaluacionesCuantitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_GESTIONAN);

  if (!esAsesor) return <AccesoDenegado />;

  return (
    <GestionEvaluacionMarco
      titulo="Gestionar evaluaciones cuantitativas"
      asignacionId={evaluacionAsesorId}
      usarAsignacion={useEvaluacionAsignadaAsesor}
    >
      {(asignacion, onVolver) => (
        <GestionCuantitativasAsesorContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionEvaluacionMarco>
  );
}
