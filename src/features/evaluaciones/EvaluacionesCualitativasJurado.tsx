import { Navigate, useNavigate, useParams } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionesCualitativasJurado from './components/ConsultarEvaluacionesCualitativasJurado';
import { useEvaluacionesCualitativasJurado } from './hooks/useEvaluacionesCualitativasJurado';
import { useNavegacionEvaluacionJurado } from './hooks/useNavegacionEvaluacionJurado';
import type { NavegacionJuradosEvaluacion } from './models/ResumenEvaluacion';

const ROLES_CONSULTAN = [Rol.Estudiante];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluación cualitativa';

export default function EvaluacionesCualitativasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esEstudiante = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionEvaluacionJurado(evaluacionJuradoId);
  const consulta = useEvaluacionesCualitativasJurado(evaluacionJuradoId);

  if (!esEstudiante) return <Navigate to="/forbidden" replace />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const rutaJurados = navegacion
    ? `/evaluaciones/${navegacion.evaluacionId}/jurados${navegacion.searchJurados}`
    : '/evaluaciones';

  const migas = navegacion
    ? [
        { etiqueta: 'Evaluaciones', to: rutaListado },
        { etiqueta: 'Evaluaciones del jurado', to: rutaJurados },
        { etiqueta: TITULO },
      ]
    : [{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }];

  const descripcion = navegacion
    ? `Jurado: ${navegacion.jurado}${
        navegacion.resumen
          ? ` · ${navegacion.resumen.proyecto} · versión ${navegacion.resumen.version}`
          : ''
      }`
    : 'Consulta la retroalimentación cualitativa del jurado.';

  function volver() {
    if (!navegacion?.resumen) {
      navigate(rutaJurados);
      return;
    }
    const state: NavegacionJuradosEvaluacion = {
      resumen: navegacion.resumen,
      search: navegacion.search,
    };
    navigate(rutaJurados, { state });
  }

  return (
    <div className={RAIZ}>
      <PageHeader titulo={TITULO} descripcion={descripcion} migas={migas} />
      <ConsultarEvaluacionesCualitativasJurado
        consulta={consulta}
        etiquetaVolver="Volver a los jurados"
        onVolver={volver}
      />
    </div>
  );
}
