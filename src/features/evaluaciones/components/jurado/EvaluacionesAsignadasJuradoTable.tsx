import type { ReactNode } from 'react';
import { ClipboardCheck, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEvaluacionJurado } from '../../../../shared/utils/estado-variante';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';
const TITULO = 'font-medium text-on-surface';
const VERSION = 'text-[13px] text-on-surface-secondary';

interface Props {
  evaluaciones: EvaluacionAsignadaJurado[];
  cargando: boolean;
  hayFiltros: boolean;
  onLimpiarFiltros: () => void;
  acciones?: (asignacion: EvaluacionAsignadaJurado) => ReactNode;
  encabezadoAcciones?: string;
}

function InsigniaEstado({ asignacion }: { asignacion: EvaluacionAsignadaJurado }) {
  return (
    <Badge variante={varianteEstadoEvaluacionJurado(asignacion.estado.id)}>
      {asignacion.estado.nombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<EvaluacionAsignadaJurado>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    celda: (asignacion) => <span className={TITULO}>{asignacion.entregable.proyecto}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (asignacion) => asignacion.entregable.version,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (asignacion) => <InsigniaEstado asignacion={asignacion} />,
  },
];

export default function EvaluacionesAsignadasJuradoTable({
  evaluaciones,
  cargando,
  hayFiltros,
  onLimpiarFiltros,
  acciones,
  encabezadoAcciones,
}: Props) {
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
      titulo="Aún no tienes evaluaciones asignadas"
      descripcion="Aparecerán aquí cuando el coordinador te asigne evaluaciones de proyectos de grado."
    />
  );

  return (
    <DataTable
      etiqueta="Evaluaciones asignadas"
      columnas={COLUMNAS}
      filas={evaluaciones}
      idDeFila={(asignacion) => asignacion.id}
      cargando={cargando}
      acciones={acciones}
      encabezadoAcciones={encabezadoAcciones}
      vacio={vacio}
      tarjeta={(asignacion) => (
        <>
          <span className={TITULO}>{asignacion.entregable.proyecto}</span>
          <span className={VERSION}>Versión {asignacion.entregable.version}</span>
          <div className={TARJETA_ESTADO}>
            <InsigniaEstado asignacion={asignacion} />
          </div>
        </>
      )}
    />
  );
}
