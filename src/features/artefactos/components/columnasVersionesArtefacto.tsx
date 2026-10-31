import Badge from '../../../shared/components/ui/Badge';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import InsigniaEstadoRevision from './InsigniaEstadoRevision';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';

export function etiquetaVersion(version: VersionArtefacto): string {
  return `Versión ${version.version}`;
}

export function construirColumnas(mostrarAsesor: boolean): ColumnaTabla<VersionArtefacto>[] {
  const columnas: ColumnaTabla<VersionArtefacto>[] = [
    {
      id: 'proyecto',
      encabezado: 'Proyecto',
      celda: (version) => <span className={NOMBRE}>{version.nombreProyecto}</span>,
    },
    {
      id: 'documento',
      encabezado: 'Documento',
      celda: (version) => (
        <>
          <span className={NOMBRE}>{version.nombreDocumento}</span>
          <span className={DETALLE}>Versión {version.versionDocumento} del documento</span>
        </>
      ),
    },
    {
      id: 'repositorio',
      encabezado: 'Repositorio',
      celda: (version) => <span className={DATO_SECUNDARIO}>{version.nombreRepositorio}</span>,
    },
  ];
  if (mostrarAsesor) {
    columnas.push({
      id: 'asesor',
      encabezado: 'Asesor',
      celda: (version) => <span className={DATO_SECUNDARIO}>{version.nombreAsesor}</span>,
    });
  }
  columnas.push(
    {
      id: 'version',
      encabezado: 'Versión',
      clave: 'version',
      ordenable: true,
      celda: (version) => <Badge variante="neutro">{etiquetaVersion(version)}</Badge>,
    },
    {
      id: 'estado',
      encabezado: 'Estado de revisión',
      clave: 'estadoRevision',
      ordenable: true,
      celda: (version) => <InsigniaEstadoRevision version={version} />,
    },
    {
      id: 'fecha',
      encabezado: 'Fecha de creación',
      clave: 'fechaCreacion',
      ordenable: true,
      celda: (version) => (
        <span className={DATO_SECUNDARIO}>{formatearFechaCreacion(version.fechaCreacion)}</span>
      ),
    },
  );
  return columnas;
}
