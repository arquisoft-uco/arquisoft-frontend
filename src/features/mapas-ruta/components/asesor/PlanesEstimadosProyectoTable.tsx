import { ClipboardList, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenCampoPlanEstimadoProyecto } from '../../models/OrdenCampoPlanEstimadoProyecto';
import type { PlanEstimadoProyecto } from '../../models/PlanEstimadoProyecto';
import { formatearDias } from '../../utils/plan-estimado';

const TAREA = 'font-medium text-on-surface';
const SIN_DESCRIPCION = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoPlanEstimadoProyecto {
  return (
    clave === 'tiempoEstimadoDias' ||
    clave === 'descripcionEstimado' ||
    clave === 'descripcionTarea'
  );
}

interface Props {
  planes: PlanEstimadoProyecto[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoPlanEstimadoProyecto, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

function DescripcionPlan({ plan }: { plan: PlanEstimadoProyecto }) {
  if (plan.descripcionEstimado === null) {
    return <span className={SIN_DESCRIPCION}>Sin descripción</span>;
  }
  return <span className="text-on-surface">{plan.descripcionEstimado}</span>;
}

const COLUMNAS: ColumnaTabla<PlanEstimadoProyecto>[] = [
  {
    id: 'tarea',
    encabezado: 'Tarea',
    clave: 'descripcionTarea',
    ordenable: true,
    celda: (plan) => <span className={TAREA}>{plan.descripcionTarea}</span>,
  },
  {
    id: 'dias',
    encabezado: 'Días estimados',
    clave: 'tiempoEstimadoDias',
    ordenable: true,
    celda: (plan) => formatearDias(plan.tiempoEstimadoDias),
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción del plan',
    clave: 'descripcionEstimado',
    ordenable: true,
    celda: (plan) => <DescripcionPlan plan={plan} />,
  },
];

export default function PlanesEstimadosProyectoTable({
  planes,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay planes estimados que coincidan con tu búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ClipboardList}
      titulo="Este proyecto aún no tiene planes estimados"
      descripcion="Aquí verás los planes estimados que el estudiante agregue a las tareas del mapa de ruta."
    />
  );

  return (
    <DataTable
      etiqueta="Planes estimados del proyecto"
      columnas={COLUMNAS}
      filas={planes}
      idDeFila={(plan) => plan.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(plan) => (
        <>
          <span className={TAREA}>{plan.descripcionTarea}</span>
          <span className="text-on-surface">{formatearDias(plan.tiempoEstimadoDias)}</span>
          <DescripcionPlan plan={plan} />
        </>
      )}
    />
  );
}
