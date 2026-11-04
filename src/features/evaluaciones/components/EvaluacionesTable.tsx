import type { ReactNode } from 'react';
import { ClipboardCheck, SearchX } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { varianteEstadoEvaluacion } from '../../../shared/utils/estado-variante';
import type { Evaluacion } from '../models/Evaluacion';
import type { OrdenCampoEvaluacion } from '../models/OrdenCampoEvaluacion';

const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';
const TITULO = 'font-medium text-on-surface';
const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se registren evaluaciones de los proyectos de grado.';
const VERSION = 'text-[13px] text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEvaluacion {
  return clave === 'proyecto' || clave === 'estado';
}

interface Props {
  evaluaciones: Evaluacion[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEvaluacion, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  acciones?: (evaluacion: Evaluacion) => ReactNode;
  encabezadoAcciones?: string;
  descripcionVacio?: string;
}

function InsigniaEstado({ evaluacion }: { evaluacion: Evaluacion }) {
  return (
    <Badge variante={varianteEstadoEvaluacion(evaluacion.estado.id)}>
      {evaluacion.estado.nombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<Evaluacion>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'proyecto',
    ordenable: true,
    celda: (evaluacion) => <span className={TITULO}>{evaluacion.entregable.proyecto}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (evaluacion) => evaluacion.entregable.version,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: 'estado',
    ordenable: true,
    celda: (evaluacion) => <InsigniaEstado evaluacion={evaluacion} />,
  },
];

export default function EvaluacionesTable({
  evaluaciones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  acciones,
  encabezadoAcciones,
  descripcionVacio = DESCRIPCION_VACIO,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay evaluaciones que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ClipboardCheck}
      titulo="Aún no hay evaluaciones"
      descripcion={descripcionVacio}
    />
  );

  return (
    <DataTable
      etiqueta="Evaluaciones"
      columnas={COLUMNAS}
      filas={evaluaciones}
      idDeFila={(evaluacion) => evaluacion.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={acciones}
      encabezadoAcciones={encabezadoAcciones}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(evaluacion) => (
        <>
          <span className={TITULO}>{evaluacion.entregable.proyecto}</span>
          <span className={VERSION}>Versión {evaluacion.entregable.version}</span>
          <div className={TARJETA_ESTADO}>
            <InsigniaEstado evaluacion={evaluacion} />
          </div>
        </>
      )}
    />
  );
}
