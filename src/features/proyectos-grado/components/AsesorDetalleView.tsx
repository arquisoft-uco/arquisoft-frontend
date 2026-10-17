import { SearchX } from 'lucide-react';
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import Tabs from '../../../shared/components/ui/Tabs';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { useDetalleProyectoGradoAsesor } from '../hooks/useDetalleProyectoGradoAsesor';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';

const RAIZ = 'flex flex-col gap-6';
const TITULO_GENERICO = 'Proyecto de grado';

export default function AsesorDetalleView() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { resumen, search } = useResumenProyectoGrado(id);
  const { data: proyecto, isLoading, error, refetch } = useDetalleProyectoGradoAsesor(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const rutaListado = `/proyectos-grado${search}`;

  if (isLoading) {
    const provisional = resumen?.titulo ?? TITULO_GENERICO;
    return (
      <div className={RAIZ}>
        <PageHeader
          titulo={provisional}
          migas={[{ etiqueta: 'Proyectos de grado', to: rutaListado }, { etiqueta: provisional }]}
        />
        <Skeleton variante="tarjetas" etiqueta="Cargando el resumen del proyecto…" />
      </div>
    );
  }

  if (isApiErrorWithStatus(error, 422)) {
    return (
      <EmptyState
        icono={SearchX}
        titulo="No encontramos este proyecto entre los que asesoras"
        descripcion="Puede que ya no tengas asignación vigente o que el proyecto no exista."
        accion={
          <Button variante="secundario" onClick={() => navigate(rutaListado)}>
            Volver a proyectos de grado
          </Button>
        }
      />
    );
  }

  if (error || !proyecto) {
    return (
      <ErrorState
        titulo="No pudimos cargar el proyecto de grado"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  }

  const titulo = proyecto.tituloProyecto;
  const pestanas = [{ id: 'resumen', etiqueta: 'Resumen', to: `/proyectos-grado/${id}/resumen` }];
  const activa = pestanas.find((p) => pathname.startsWith(p.to)) ?? pestanas[0];

  return (
    <div className={RAIZ}>
      <PageHeader
        titulo={titulo}
        migas={[{ etiqueta: 'Proyectos de grado', to: rutaListado }, { etiqueta: titulo }]}
        insignia={
          <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
        }
      />
      <Tabs items={pestanas} valor={activa.id} etiqueta="Secciones del proyecto de grado" />
      <Outlet />
    </div>
  );
}
