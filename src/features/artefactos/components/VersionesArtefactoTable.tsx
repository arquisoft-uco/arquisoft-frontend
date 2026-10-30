import { FileStack, SearchX } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { VersionArtefacto } from '../models/VersionArtefacto';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

function etiquetaVersion(version: VersionArtefacto): string {
  return `Versión ${version.version}`;
}

function construirColumnas(mostrarAsesor: boolean): ColumnaTabla<VersionArtefacto>[] {
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

interface Props {
  versiones: VersionArtefacto[];
  descripcionVacio: string;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  mostrarAsesor?: boolean;
}

export default function VersionesArtefactoTable({
  versiones,
  descripcionVacio,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  mostrarAsesor = false,
}: Props) {
  const columnas = construirColumnas(mostrarAsesor);

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay versiones que coincidan con los filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={FileStack}
      titulo="Aún no hay versiones de artefactos"
      descripcion={descripcionVacio}
    />
  );

  return (
    <DataTable
      etiqueta="Versiones de artefactos"
      columnas={columnas}
      filas={versiones}
      idDeFila={(version) => version.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(version) => (
        <>
          <p className={TARJETA_NOMBRE}>{version.nombreDocumento}</p>
          <p className={TARJETA_DATO}>
            {version.nombreProyecto} · {version.nombreRepositorio}
          </p>
          <p className={TARJETA_DATO}>
            {etiquetaVersion(version)} · {formatearFechaCreacion(version.fechaCreacion)}
          </p>
          {mostrarAsesor && <p className={TARJETA_DATO}>{version.nombreAsesor}</p>}
        </>
      )}
    />
  );
}
