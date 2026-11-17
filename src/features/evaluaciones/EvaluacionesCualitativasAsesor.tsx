import { useNavigate, useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionesCualitativasAsesor from './components/asesor/ConsultarEvaluacionesCualitativasAsesor';
import { useEvaluacionesCualitativasAsesor } from './hooks/useEvaluacionesCualitativasAsesor';
import { useNavegacionCualitativasAsesor } from './hooks/useNavegacionCualitativasAsesor';

const ROLES_CONSULTAN = [Rol.Asesor];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluaciones cualitativas realizadas';

export default function EvaluacionesCualitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCualitativasAsesor(evaluacionAsesorId);
  const consulta = useEvaluacionesCualitativasAsesor(evaluacionAsesorId);

  if (!esAsesor) return <AccesoDenegado />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const resumen = navegacion?.resumen;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta las valoraciones cualitativas que registraste.';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={TITULO}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }]}
      />
      <ConsultarEvaluacionesCualitativasAsesor
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
      />
    </div>
  );
}
