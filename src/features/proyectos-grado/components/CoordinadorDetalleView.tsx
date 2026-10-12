import { Navigate, Outlet, useParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import AccionesProyectoGradoCoordinador from './coordinador/AccionesProyectoGradoCoordinador';
import { DISPOSICION } from './disposicion';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const TITULO_GENERICO = 'Proyecto de grado';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search } = useResumenProyectoGrado(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const titulo = resumen?.titulo ?? TITULO_GENERICO;
  const pestanas = [
    { id: 'asesores', etiqueta: 'Asesores', to: `/proyectos-grado/${id}/asesores` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={titulo}
        migas={[
          { etiqueta: 'Proyectos de grado', to: `/proyectos-grado${search}` },
          { etiqueta: titulo },
        ]}
      />
      <div className={DISPOSICION.contenedor}>
        <div className={DISPOSICION.principal}>
          <Tabs items={pestanas} valor="asesores" etiqueta="Secciones del proyecto de grado" />
          <Outlet />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel
            resumen={resumen}
            accion={<AccionesProyectoGradoCoordinador proyectoGradoId={id} titulo={titulo} />}
          />
        </div>
      </div>
    </div>
  );
}
