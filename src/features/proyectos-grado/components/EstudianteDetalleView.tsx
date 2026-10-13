import { Navigate, Outlet, useParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import { DISPOSICION } from './disposicion';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const TITULO_GENERICO = 'Proyecto de grado';

export default function EstudianteDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search } = useResumenProyectoGrado(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const titulo = resumen?.titulo ?? TITULO_GENERICO;
  const pestanas = [
    { id: 'estados', etiqueta: 'Historial de estados', to: `/proyectos-grado/${id}/estados` },
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
          <Tabs items={pestanas} valor="estados" etiqueta="Secciones del proyecto de grado" />
          <Outlet />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel resumen={resumen} />
        </div>
      </div>
    </div>
  );
}
