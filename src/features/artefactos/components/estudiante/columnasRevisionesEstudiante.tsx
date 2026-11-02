import Badge from '../../../../shared/components/ui/Badge';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import { varianteEstadoRevisionAsesor } from '../../../../shared/utils/estado-variante';
import { formatearFechaCreacion } from '../../../../shared/utils/formato-version';
import type { RevisionAsesorEstudiante } from '../../models/RevisionAsesorEstudiante';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';

export function textoObservaciones(revision: RevisionAsesorEstudiante): string {
  if (revision.totalObservaciones === 0) return 'Sin observaciones';
  if (revision.observacionesAbiertas === 0) return 'Todas solucionadas';
  return `${revision.observacionesAbiertas} de ${revision.totalObservaciones} abiertas`;
}

export const COLUMNAS_REVISIONES: ColumnaTabla<RevisionAsesorEstudiante>[] = [
  {
    id: 'documento',
    encabezado: 'Documento',
    celda: (revision) => (
      <>
        <span className={NOMBRE}>{revision.nombreDocumento}</span>
        <span className={DETALLE}>Versión {revision.versionDocumento} del documento</span>
      </>
    ),
  },
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    celda: (revision) => <span className={DATO_SECUNDARIO}>{revision.nombreProyecto}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión revisada',
    clave: 'version',
    ordenable: true,
    celda: (revision) => <Badge variante="neutro">Versión {revision.version}</Badge>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    clave: 'estadoRevisionAsesor',
    ordenable: true,
    celda: (revision) => (
      <Badge variante={varianteEstadoRevisionAsesor(revision.estadoRevisionAsesor)}>
        {revision.estadoRevisionAsesorNombre}
      </Badge>
    ),
  },
  {
    id: 'observaciones',
    encabezado: 'Observaciones',
    celda: (revision) => <span className={DATO_SECUNDARIO}>{textoObservaciones(revision)}</span>,
  },
  {
    id: 'fecha',
    encabezado: 'Fecha de la revisión',
    clave: 'fechaCreacion',
    ordenable: true,
    celda: (revision) => (
      <span className={DATO_SECUNDARIO}>{formatearFechaCreacion(revision.fechaCreacion)}</span>
    ),
  },
];
