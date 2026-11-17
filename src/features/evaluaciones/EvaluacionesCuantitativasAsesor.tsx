import { useNavigate, useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import EvaluacionesCuantitativasRealizadasAsesorPanel from './components/asesor/EvaluacionesCuantitativasRealizadasAsesorPanel';
import { useEvaluacionesCuantitativasAsesor } from './hooks/useEvaluacionesCuantitativasAsesor';
import { useNavegacionCuantitativasAsesor } from './hooks/useNavegacionCuantitativasAsesor';

const ROLES_CONSULTAN = [Rol.Asesor];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluaciones cuantitativas realizadas';

export default function EvaluacionesCuantitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCuantitativasAsesor(evaluacionAsesorId);
  const consulta = useEvaluacionesCuantitativasAsesor(evaluacionAsesorId);

  if (!esAsesor) return <AccesoDenegado />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const resumen = navegacion?.resumen;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta las valoraciones cuantitativas que registraste.';

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={TITULO}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }]}
      />
      <EvaluacionesCuantitativasRealizadasAsesorPanel
        evaluacionAsesorId={evaluacionAsesorId}
        finalizada={navegacion?.evaluacionFinalizada ?? false}
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
      />
    </div>
  );
}
