import { useNavigate, useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionAsesor from './components/estudiante/ConsultarEvaluacionAsesor';
import { useEvaluacionAsesor } from './hooks/useEvaluacionAsesor';
import { useResumenEvaluacion } from './hooks/useResumenEvaluacion';

const ROLES_CONSULTAN = [Rol.Estudiante];
const RAIZ = 'flex flex-col gap-6';

export default function EvaluacionDelAsesor() {
  const { evaluacionId = '' } = useParams();
  const esEstudiante = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const { resumen, search } = useResumenEvaluacion(evaluacionId);
  const consulta = useEvaluacionAsesor(evaluacionId);

  if (!esEstudiante) return <AccesoDenegado />;

  const rutaListado = `/evaluaciones${search}`;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta el asesor que evaluó este entregable.';
  const migas = [
    { etiqueta: 'Evaluaciones', to: rutaListado },
    { etiqueta: 'Evaluación del asesor' },
  ];

  return (
    <div className={RAIZ}>
      <PageHeader titulo="Evaluación del asesor" descripcion={descripcion} migas={migas} />
      <ConsultarEvaluacionAsesor consulta={consulta} onVolver={() => navigate(rutaListado)} />
    </div>
  );
}
