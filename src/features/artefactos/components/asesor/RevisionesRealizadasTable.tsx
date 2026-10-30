import { ClipboardList, MessageSquare, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla, DireccionOrden } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { varianteEstadoRevisionAsesor } from '../../../../shared/utils/estado-variante';
import type { RevisionAsesor } from '../../models/RevisionAsesor';

const TARJETA = 'flex flex-wrap items-center justify-between gap-1.5';
const CLAVE_ORDEN = 'estadoRevisionAsesor';

interface Props {
  revisiones: RevisionAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  direccionOrden: DireccionOrden;
  onOrdenar: (direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onVerObservaciones: (revision: RevisionAsesor) => void;
}

function InsigniaEstado({ revision }: { revision: RevisionAsesor }) {
  return (
    <Badge variante={varianteEstadoRevisionAsesor(revision.estadoId)}>
      {revision.estadoNombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<RevisionAsesor>[] = [
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (revision) => <span className="font-medium">Versión {revision.version}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: CLAVE_ORDEN,
    ordenable: true,
    celda: (revision) => <InsigniaEstado revision={revision} />,
  },
];

export default function RevisionesRealizadasTable({
  revisiones,
  cargando,
  hayFiltros,
  direccionOrden,
  onOrdenar,
  onLimpiarFiltros,
  onVerObservaciones,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (clave === CLAVE_ORDEN) onOrdenar(direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay revisiones con los estados elegidos."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ClipboardList}
      titulo="Aún no has realizado revisiones"
      descripcion="Aparecerán aquí cuando registres una revisión sobre un artefacto que asesoras."
    />
  );

  return (
    <DataTable
      etiqueta="Revisiones realizadas"
      columnas={COLUMNAS}
      filas={revisiones}
      idDeFila={(revision) => revision.id}
      orden={{ clave: CLAVE_ORDEN, direccion: direccionOrden }}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      acciones={(revision) => (
        <RowMenu
          etiqueta={`Acciones de la revisión de la versión ${revision.version}`}
          acciones={[
            {
              etiqueta: 'Ver observaciones',
              icono: MessageSquare,
              onSeleccionar: () => onVerObservaciones(revision),
            },
          ]}
        />
      )}
      tarjeta={(revision) => (
        <div className={TARJETA}>
          <span className="font-medium">Versión {revision.version}</span>
          <InsigniaEstado revision={revision} />
        </div>
      )}
    />
  );
}
