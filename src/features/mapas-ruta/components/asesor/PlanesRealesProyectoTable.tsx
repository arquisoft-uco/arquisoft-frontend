import { ClipboardList, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenCampoPlanRealProyecto } from '../../models/OrdenCampoPlanRealProyecto';
import type { PlanRealProyecto } from '../../models/PlanRealProyecto';
import { formatearDias } from '../../utils/plan-estimado';

const SUBTEXTO = 'text-[13px] text-on-surface-secondary';
const TITULO_TARJETA = 'font-medium text-on-surface';

function esOrdenCampo(clave: string): clave is OrdenCampoPlanRealProyecto {
  return clave === 'tiempoRealDias' || clave === 'descripcionTarea' || clave === 'descripcionReal';
}

function textoDescripcion(plan: PlanRealProyecto): string {
  return plan.descripcionReal ?? 'Sin descripción';
}

const COLUMNAS: ColumnaTabla<PlanRealProyecto>[] = [
  {
    id: 'descripcionTarea',
    encabezado: 'Tarea',
    clave: 'descripcionTarea',
    ordenable: true,
    celda: (plan) => <span className={TITULO_TARJETA}>{plan.descripcionTarea}</span>,
  },
  {
    id: 'tiempoRealDias',
    encabezado: 'Días reales',
    clave: 'tiempoRealDias',
    ordenable: true,
    celda: (plan) => formatearDias(plan.tiempoRealDias),
  },
  {
    id: 'descripcionReal',
    encabezado: 'Descripción',
    clave: 'descripcionReal',
    ordenable: true,
    celda: (plan) => textoDescripcion(plan),
  },
];

interface Props {
  planes: PlanRealProyecto[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoPlanRealProyecto, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onAportar?: (plan: PlanRealProyecto) => void;
}

export default function PlanesRealesProyectoTable({
  planes,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onAportar,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay planes reales que coincidan con tu búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ClipboardList}
      titulo="Aún no hay planes reales"
      descripcion="Aquí verás el tiempo real que registren los estudiantes en las tareas de este proyecto."
    />
  );

  return (
    <DataTable
      etiqueta="Planes reales del proyecto"
      columnas={COLUMNAS}
      filas={planes}
      idDeFila={(plan) => plan.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={
        onAportar
          ? (plan) => (
              <Button
                variante="secundario"
                tamano="sm"
                aria-label={`Aportar al plan real de ${plan.descripcionTarea}`}
                onClick={() => onAportar(plan)}
              >
                Aportar
              </Button>
            )
          : undefined
      }
      cargando={cargando}
      vacio={vacio}
      tarjeta={(plan) => (
        <>
          <span className={TITULO_TARJETA}>{plan.descripcionTarea}</span>
          <span className={SUBTEXTO}>{formatearDias(plan.tiempoRealDias)}</span>
          <span className="text-on-surface">{textoDescripcion(plan)}</span>
        </>
      )}
    />
  );
}
