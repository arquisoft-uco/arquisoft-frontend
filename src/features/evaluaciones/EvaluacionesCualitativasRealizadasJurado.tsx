import { Navigate, useNavigate, useParams } from 'react-router';
import { useHasRole } from '../../hooks/useHasRole';
import PageHeader from '../../shared/components/ui/PageHeader';
import { Rol } from '../../shared/models/rol';
import ConsultarEvaluacionesCualitativasJurado from './components/ConsultarEvaluacionesCualitativasJurado';
import { useEvaluacionesCualitativasRealizadasJurado } from './hooks/useEvaluacionesCualitativasRealizadasJurado';
import { useNavegacionCualitativasRealizadasJurado } from './hooks/useNavegacionCualitativasRealizadasJurado';

const ROLES_CONSULTAN = [Rol.Jurado];
const RAIZ = 'flex flex-col gap-6';
const TITULO = 'Evaluaciones cualitativas realizadas';

export default function EvaluacionesCualitativasRealizadasJurado() {
  const { evaluacionJuradoId = '' } = useParams();
  const esJurado = useHasRole(ROLES_CONSULTAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCualitativasRealizadasJurado(evaluacionJuradoId);
  const consulta = useEvaluacionesCualitativasRealizadasJurado(evaluacionJuradoId);

  if (!esJurado) return <Navigate to="/forbidden" replace />;

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
      <ConsultarEvaluacionesCualitativasJurado
        consulta={consulta}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={() => navigate(rutaListado)}
      />
    </div>
  );
}
