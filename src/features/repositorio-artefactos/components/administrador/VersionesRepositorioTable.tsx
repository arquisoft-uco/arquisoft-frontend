import { FileStack, Upload } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { VersionRepositorioArtefacto } from '../../models/VersionRepositorioArtefacto';
import { formatearFechaCreacion, formatearTamano } from '../../utils/formato-version';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const HUELLA = 'font-mono text-[13px] text-on-surface-secondary';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';
const CARACTERES_HUELLA = 12;

function etiquetaVersion(version: VersionRepositorioArtefacto): string {
  return `Versión ${version.numeroVersion}`;
}

function Huella({ valor }: { valor?: string }) {
  if (!valor) return <span className={DATO_SECUNDARIO}>No disponible</span>;
  return (
    <span className={HUELLA} title={valor}>
      {valor.slice(0, CARACTERES_HUELLA)}…
    </span>
  );
}

const COLUMNAS: ColumnaTabla<VersionRepositorioArtefacto>[] = [
  {
    id: 'documento',
    encabezado: 'Documento',
    celda: (version) => (
      <>
        <span className={NOMBRE}>{version.nombreDocumento}</span>
        <span className={DETALLE}>{version.nombreArchivo}</span>
      </>
    ),
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (version) => <Badge variante="neutro">{etiquetaVersion(version)}</Badge>,
  },
  {
    id: 'fecha',
    encabezado: 'Fecha de creación',
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
  {
    id: 'huella',
    encabezado: 'Huella SHA-256',
    celda: (version) => <Huella valor={version.hashSha256} />,
  },
];

interface Props {
  versiones: VersionRepositorioArtefacto[];
  cargando: boolean;
  onSubir?: () => void;
}

export default function VersionesRepositorioTable({ versiones, cargando, onSubir }: Props) {
  return (
    <DataTable
      etiqueta="Versiones del repositorio"
      columnas={COLUMNAS}
      filas={versiones}
      idDeFila={(version) => version.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={FileStack}
          titulo="Este repositorio aún no tiene versiones"
          descripcion="Aparecerán aquí cuando se cargue una versión."
          accion={
            onSubir && (
              <Button icono={Upload} onClick={onSubir}>
                Subir versión
              </Button>
            )
          }
        />
      }
      tarjeta={(version) => (
        <>
          <p className={TARJETA_NOMBRE}>{version.nombreDocumento}</p>
          <p className={TARJETA_DATO}>{etiquetaVersion(version)}</p>
          <p className={TARJETA_DATO}>{formatearFechaCreacion(version.fechaCreacion)}</p>
          <p className={TARJETA_DATO}>{formatearTamano(version.tamanoBytes)}</p>
        </>
      )}
    />
  );
}
