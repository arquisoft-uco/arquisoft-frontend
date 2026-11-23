import { useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import { Rol } from '../../shared/models/rol';
import GestionEvaluacionMarco from './components/GestionEvaluacionMarco';
import GestionCualitativasAsesorContenido from './components/asesor/GestionCualitativasAsesorContenido';
import { useEvaluacionAsignadaAsesor } from './hooks/useEvaluacionAsignadaAsesor';

const ROLES_GESTIONAN = [Rol.Asesor];

export default function GestionarEvaluacionesCualitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_GESTIONAN);

  if (!esAsesor) return <AccesoDenegado />;

  return (
    <GestionEvaluacionMarco
      titulo="Gestionar evaluaciones cualitativas"
      asignacionId={evaluacionAsesorId}
      usarAsignacion={useEvaluacionAsignadaAsesor}
    >
      {(asignacion, onVolver) => (
        <GestionCualitativasAsesorContenido asignacion={asignacion} onVolver={onVolver} />
      )}
    </GestionEvaluacionMarco>
  );
}
