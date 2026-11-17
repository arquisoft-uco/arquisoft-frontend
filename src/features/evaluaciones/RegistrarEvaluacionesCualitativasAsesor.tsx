import { ClipboardX } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import AccesoDenegado from '../../shared/components/AccesoDenegado';
import { useHasRole } from '../../hooks/useHasRole';
import Button from '../../shared/components/ui/Button';
import EmptyState from '../../shared/components/ui/EmptyState';
import ErrorState from '../../shared/components/ui/ErrorState';
import Notice from '../../shared/components/ui/Notice';
import PageHeader from '../../shared/components/ui/PageHeader';
import Skeleton from '../../shared/components/ui/Skeleton';
import { Rol } from '../../shared/models/rol';
import { getApiErrorMessage } from '../../shared/utils/api-error';
import RegistrarEvaluacionesCualitativasAsesorForm from './components/asesor/RegistrarEvaluacionesCualitativasAsesorForm';
import { useEvaluacionAsignadaAsesor } from './hooks/useEvaluacionAsignadaAsesor';
import { useNavegacionCualitativasAsesor } from './hooks/useNavegacionCualitativasAsesor';
import { ESTADO_FINALIZADA } from './utils/estados-evaluacion';

const ROLES_REGISTRAN = [Rol.Asesor];
const RAIZ = 'flex flex-col gap-6';
const CUERPO = 'w-full max-w-3xl';

export default function RegistrarEvaluacionesCualitativasAsesor() {
  const { evaluacionAsesorId = '' } = useParams();
  const esAsesor = useHasRole(ROLES_REGISTRAN);
  const navigate = useNavigate();
  const navegacion = useNavegacionCualitativasAsesor(evaluacionAsesorId);
  const { data, isLoading, isError, error, refetch } =
    useEvaluacionAsignadaAsesor(evaluacionAsesorId);

  if (!esAsesor) return <AccesoDenegado />;

  const rutaListado = `/evaluaciones${navegacion?.search ?? ''}`;
  const migas = [{ etiqueta: 'Evaluaciones', to: rutaListado }, { etiqueta: 'Evaluar proyecto' }];
  const asignacion = data ?? undefined;
  const descripcion = asignacion
    ? `${asignacion.entregable.proyecto} · versión ${asignacion.entregable.version}`
    : 'Registra las valoraciones del proyecto.';
  const volver = (
    <Button variante="secundario" onClick={() => navigate(rutaListado)}>
      Volver a mis evaluaciones
    </Button>
  );

  function contenido() {
    if (isLoading) return <Skeleton variante="formulario" etiqueta="Cargando la evaluación" />;
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudo cargar la evaluación"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }
    if (!asignacion) {
      return (
        <EmptyState
          icono={ClipboardX}
          titulo="Esta evaluación no está entre tus asignaciones"
          descripcion="Puede que ya no esté disponible. Vuelve a tu lista para elegir otra."
          accion={volver}
        />
      );
    }
    if (asignacion.evaluacion.estado.id === ESTADO_FINALIZADA) {
      return (
        <div className="flex flex-col items-start gap-4">
          <Notice variante="advertencia">
            La evaluación está finalizada y no admite nuevas valoraciones.
          </Notice>
          {volver}
        </div>
      );
    }
    return (
      <RegistrarEvaluacionesCualitativasAsesorForm
        asignacion={asignacion}
        rutaListado={rutaListado}
      />
    );
  }

  return (
    <div className={RAIZ}>
      <PageHeader titulo="Evaluar proyecto" descripcion={descripcion} migas={migas} />
      <div className={CUERPO}>{contenido()}</div>
    </div>
  );
}
