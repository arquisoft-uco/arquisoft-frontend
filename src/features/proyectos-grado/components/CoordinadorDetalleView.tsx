import { Navigate, Outlet, useLocation, useParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import type { ContextoDetalleProyectoGrado } from '../models/ContextoDetalleProyectoGrado';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import AccionesProyectoGradoCoordinador from './coordinador/AccionesProyectoGradoCoordinador';
import { ESTADO_FINALIZADO } from '../utils/estados-proyecto';
import { DISPOSICION } from './disposicion';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

const TITULO_GENERICO = 'Proyecto de grado';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const { resumen, search } = useResumenProyectoGrado(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const titulo = resumen?.titulo ?? TITULO_GENERICO;
  const finalizado = resumen?.estadoId === ESTADO_FINALIZADO;
  const pestanas = [
    { id: 'asesores', etiqueta: 'Asesores', to: `/proyectos-grado/${id}/asesores` },
    { id: 'estados', etiqueta: 'Estados', to: `/proyectos-grado/${id}/estados` },
  ];
  const activa = pestanas.find((p) => pathname.startsWith(p.to)) ?? pestanas[0];

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
          <Tabs items={pestanas} valor={activa.id} etiqueta="Secciones del proyecto de grado" />
          <Outlet context={{ titulo, finalizado } satisfies ContextoDetalleProyectoGrado} />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel
            resumen={resumen}
            accion={
              <AccionesProyectoGradoCoordinador
                proyectoGradoId={id}
                titulo={titulo}
                finalizado={finalizado}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
