import { Eye, MessageSquare, MessageSquareText, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { DireccionOrden, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { varianteEstadoRevisionAsesor } from '../../../../shared/utils/estado-variante';
import { formatearFechaCreacion } from '../../../../shared/utils/formato-version';
import type { RevisionAsesorEstudiante } from '../../models/RevisionAsesorEstudiante';
import { ESTADO_REVISION_EN_PROGRESO } from '../../utils/revision-resoluble';
import { COLUMNAS_REVISIONES, textoObservaciones } from './columnasRevisionesEstudiante';

const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props {
  revisiones: RevisionAsesorEstudiante[];
  descripcionVacio: string;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onGestionar: (revision: RevisionAsesorEstudiante) => void;
}

export default function RevisionesEstudianteTable({
  revisiones,
  descripcionVacio,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onGestionar,
}: Props) {
  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay revisiones que coincidan con los filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={MessageSquareText}
      titulo="Aún no tienes revisiones"
      descripcion={descripcionVacio}
    />
  );

  return (
    <DataTable
      etiqueta="Revisiones de artefactos"
      columnas={COLUMNAS_REVISIONES}
      filas={revisiones}
      idDeFila={(revision) => revision.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      acciones={(revision) => {
        const enProgreso = revision.estadoRevisionAsesor === ESTADO_REVISION_EN_PROGRESO;
        return (
          <RowMenu
            etiqueta={`Acciones de la revisión de la versión ${revision.version} de ${revision.nombreDocumento}`}
            acciones={[
              {
                etiqueta: enProgreso ? 'Gestionar revisión' : 'Ver revisión',
                icono: enProgreso ? MessageSquare : Eye,
                onSeleccionar: () => onGestionar(revision),
              },
            ]}
          />
        );
      }}
      tarjeta={(revision) => (
        <>
          <p className={TARJETA_NOMBRE}>{revision.nombreDocumento}</p>
          <p className={TARJETA_DATO}>{revision.nombreProyecto}</p>
          <p className={TARJETA_DATO}>
            Versión {revision.version} · {formatearFechaCreacion(revision.fechaCreacion)}
          </p>
          <p className={TARJETA_DATO}>{textoObservaciones(revision)}</p>
          <Badge variante={varianteEstadoRevisionAsesor(revision.estadoRevisionAsesor)}>
            {revision.estadoRevisionAsesorNombre}
          </Badge>
        </>
      )}
    />
  );
}
