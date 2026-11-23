import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import RedirigirAlListado from '../../../shared/components/RedirigirAlListado';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { TTL_CONTEXTO_CORTO_MS } from '../../../shared/utils/contexto-temporal';
import type { ContextoDetalleProyectoGrado } from '../models/ContextoDetalleProyectoGrado';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import AccionesProyectoGradoCoordinador from './coordinador/AccionesProyectoGradoCoordinador';
import { esSoloLectura } from '../utils/estados-proyecto';
import { DISPOSICION } from './disposicion';
import ResumenProyectoGradoPanel from './ResumenProyectoGradoPanel';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resumen, search } = useResumenProyectoGrado(id, TTL_CONTEXTO_CORTO_MS);

  if (!id) return <Navigate to="/proyectos-grado" replace />;
  if (!resumen) return <RedirigirAlListado destino="/proyectos-grado" />;

  const titulo = resumen.titulo;
  const soloLectura = esSoloLectura(resumen.estadoId);
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
          <Outlet context={{ titulo, soloLectura } satisfies ContextoDetalleProyectoGrado} />
        </div>
        <div className={DISPOSICION.lateral}>
          <ResumenProyectoGradoPanel
            resumen={resumen}
            accion={
              <AccionesProyectoGradoCoordinador
                proyectoGradoId={id}
                titulo={titulo}
                estadoId={resumen.estadoId}
                soloLectura={soloLectura}
                onCancelado={() => navigate(`/proyectos-grado${search}`)}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
