import { Navigate, Outlet, useParams } from 'react-router';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Tabs from '../../../shared/components/ui/Tabs';
import { useResumenProyectoGrado } from '../hooks/useResumenProyectoGrado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';

const TITULO_GENERICO = 'Proyecto de grado';

export default function CoordinadorDetalleView() {
  const { id = '' } = useParams();
  const { resumen, search } = useResumenProyectoGrado(id);

  if (!id) return <Navigate to="/proyectos-grado" replace />;

  const titulo = resumen?.titulo ?? TITULO_GENERICO;
  const pestanas = [
    { id: 'asesores', etiqueta: 'Asesores', to: `/proyectos-grado/${id}/asesores` },
  ];
  const insignia =
    resumen?.estadoId && resumen.estadoNombre ? (
      <InsigniaEstadoProyecto estadoId={resumen.estadoId} nombre={resumen.estadoNombre} />
    ) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo={titulo}
        insignia={insignia}
        migas={[
          { etiqueta: 'Proyectos de grado', to: `/proyectos-grado${search}` },
          { etiqueta: titulo },
        ]}
      />
      <Tabs items={pestanas} valor="asesores" etiqueta="Secciones del proyecto de grado" />
      <Outlet />
    </div>
  );
}
