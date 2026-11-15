import type { ReactNode } from 'react';
import { ClipboardCheck, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEvaluacion } from '../../../../shared/utils/estado-variante';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import type { OrdenCampoEvaluacion } from '../../models/OrdenCampoEvaluacion';

const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';
const TITULO = 'font-medium text-on-surface';
const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se registren evaluaciones de los proyectos de grado.';
const VERSION = 'text-[13px] text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEvaluacion {
  return clave === 'proyecto' || clave === 'estado';
}

interface Props {
  evaluaciones: EvaluacionAsignadaAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEvaluacion, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  descripcionVacio?: string;
  acciones?: (fila: EvaluacionAsignadaAsesor) => ReactNode;
  encabezadoAcciones?: string;
}

function InsigniaEstado({ fila }: { fila: EvaluacionAsignadaAsesor }) {
  return (
    <Badge variante={varianteEstadoEvaluacion(fila.evaluacion.estado.id)}>
      {fila.evaluacion.estado.nombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<EvaluacionAsignadaAsesor>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'proyecto',
    ordenable: true,
    celda: (fila) => <span className={TITULO}>{fila.entregable.proyecto}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (fila) => fila.entregable.version,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: 'estado',
    ordenable: true,
    celda: (fila) => <InsigniaEstado fila={fila} />,
  },
];

export default function EvaluacionesAsignadasAsesorTable({
  evaluaciones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  descripcionVacio = DESCRIPCION_VACIO,
  acciones,
  encabezadoAcciones,
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
      idDeFila={(fila) => fila.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      acciones={acciones}
      encabezadoAcciones={encabezadoAcciones}
      vacio={vacio}
      tarjeta={(fila) => (
        <>
          <span className={TITULO}>{fila.entregable.proyecto}</span>
          <span className={VERSION}>Versión {fila.entregable.version}</span>
          <div className={TARJETA_ESTADO}>
            <InsigniaEstado fila={fila} />
          </div>
        </>
      )}
    />
  );
}
