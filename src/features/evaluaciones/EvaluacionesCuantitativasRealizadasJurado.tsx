import { Navigate, useNavigate, useParams } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionesCuantitativasRealizadasJurado from './components/ConsultarEvaluacionesCuantitativasRealizadasJurado';
import { useEvaluacionesCuantitativasRealizadasJurado } from './hooks/useEvaluacionesCuantitativasRealizadasJurado';
import { useNavegacionCuantitativasRealizadasJurado } from './hooks/useNavegacionCuantitativasRealizadasJurado';

const ROLES_CONSULTAN = [Rol.Jurado];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluaciones cuantitativas realizadas';

export default function EvaluacionesCuantitativasRealizadasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCuantitativasRealizadasJurado(evaluacionJuradoId);
  const consulta = useEvaluacionesCuantitativasRealizadasJurado(evaluacionJuradoId);

  if (!esJurado) return <Navigate to="/forbidden" replace />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const resumen = navegacion?.resumen;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta los puntajes que registraste.';
  const finalizada = navegacion?.evaluacionFinalizada ?? false;

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={TITULO}
        descripcion={descripcion}
        migas={[{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: TITULO }]}
      />
      <ConsultarEvaluacionesCuantitativasRealizadasJurado
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
        evaluacionFinalizada={finalizada}
        onEvaluar={
          finalizada
            ? undefined
            : () => navigate(`/evaluaciones/${evaluacionJuradoId}/evaluar-cuantitativas`)
        }
      />
    </div>
  );
}
