import { FileStack, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { formatearFechaCreacion, formatearTamano } from '../../../../shared/utils/formato-version';
import type { VersionRepositorioAsesor } from '../../models/VersionRepositorioAsesor';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

function etiquetaVersion(version: VersionRepositorioAsesor): string {
  return `Versión ${version.numeroVersion}`;
}

const COLUMNAS: ColumnaTabla<VersionRepositorioAsesor>[] = [
  {
    id: 'documento',
    encabezado: 'Documento',
    clave: 'nombreDocumento',
    ordenable: true,
    celda: (version) => (
      <>
        <span className={NOMBRE}>{version.nombreDocumento}</span>
        <span className={DETALLE}>{version.nombreArchivo}</span>
      </>
    ),
  },
  {
    id: 'repositorio',
    encabezado: 'Repositorio',
    clave: 'nombreRepositorio',
    ordenable: true,
    celda: (version) => (
      <span className={DATO_SECUNDARIO}>{version.repositorioArtefacto.nombreRepositorio}</span>
    ),
  },
  {
    id: 'version',
    encabezado: 'Versión',
    clave: 'numeroVersion',
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
  {
    id: 'tipo',
    encabezado: 'Tipo de contenido',
    celda: (version) => <span className={DATO_SECUNDARIO}>{version.tipoContenido}</span>,
  },
  {
    id: 'tamano',
    encabezado: 'Tamaño',
    celda: (version) => (
      <span className={DATO_SECUNDARIO}>{formatearTamano(version.tamanoBytes)}</span>
    ),
  },
];

interface Props {
  versiones: VersionRepositorioAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function VersionesRepositorioAsesorTable({
  versiones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay versiones que coincidan con la búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={FileStack}
      titulo="Aún no hay versiones de repositorio"
      descripcion="Aparecerán aquí cuando el administrador cargue una versión."
    />
  );

  return (
    <DataTable
      etiqueta="Versiones de repositorio"
      columnas={COLUMNAS}
      filas={versiones}
      idDeFila={(version) => version.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(version) => (
        <>
          <p className={TARJETA_NOMBRE}>{version.nombreDocumento}</p>
          <p className={TARJETA_DATO}>{version.repositorioArtefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>
            {etiquetaVersion(version)} · {formatearFechaCreacion(version.fechaCreacion)}
          </p>
          <p className={TARJETA_DATO}>{formatearTamano(version.tamanoBytes)}</p>
        </>
      )}
    />
  );
}
