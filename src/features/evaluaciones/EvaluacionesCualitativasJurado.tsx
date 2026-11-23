import { useNavigate, useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import RedirigirAlListado from '../../shared/components/RedirigirAlListado';
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

  if (!esEstudiante) return <AccesoDenegado />;

  if (!navegacion) return <RedirigirAlListado destino="/evaluaciones" />;

  const rutaListado = `/evaluaciones${navegacion.search}`;
  const rutaJurados = `/evaluaciones/${navegacion.evaluacionId}/jurados${navegacion.searchJurados}`;
  const estadoJurados: NavegacionJuradosEvaluacion = {
    resumen: navegacion.resumen,
    search: navegacion.search,
  };

  const migas = [
    { etiqueta: 'Evaluaciones', to: rutaListado },
    { etiqueta: 'Evaluaciones del jurado', to: rutaJurados, state: estadoJurados },
    { etiqueta: TITULO },
  ];

  const descripcion = `Jurado: ${navegacion.jurado} · ${navegacion.resumen.proyecto} · versión ${navegacion.resumen.version}`;

  function volver() {
    navigate(rutaJurados, { state: estadoJurados });
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
