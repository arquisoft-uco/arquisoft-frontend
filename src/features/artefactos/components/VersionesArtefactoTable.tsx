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
import type { ArtefactoConNombre } from '../models/ArtefactoConNombre';
import { nombreArtefacto } from '../utils/nombre-artefacto';
import type { VersionArtefacto } from '../models/VersionArtefacto';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const DETALLE = 'block text-[13px] text-on-surface-secondary';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';
const SIN_NOMBRE = 'Artefacto sin nombre';

function etiquetaVersion(version: VersionArtefacto): string {
  return `Versión ${version.version}`;
}

const CARGANDO_NOMBRE = 'Cargando…';

interface Props {
  versiones: VersionArtefacto[];
  artefactoDe: (id: string) => ArtefactoConNombre | undefined;
  nombresCargando?: boolean;
  descripcionVacio: string;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function VersionesArtefactoTable({
  versiones,
  artefactoDe,
  nombresCargando = false,
  descripcionVacio,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  const textoSinNombre = nombresCargando ? CARGANDO_NOMBRE : SIN_NOMBRE;
  function nombreDeFila(version: VersionArtefacto): string {
    const artefacto = artefactoDe(version.artefacto);
    return artefacto ? nombreArtefacto(artefacto) : textoSinNombre;
  }

  const columnas: ColumnaTabla<VersionArtefacto>[] = [
    {
      id: 'artefacto',
      encabezado: 'Artefacto',
      celda: (version) => {
        const artefacto = artefactoDe(version.artefacto);
        if (!artefacto) return <span className={DATO_SECUNDARIO}>{textoSinNombre}</span>;
        return (
          <>
            <span className={NOMBRE}>{artefacto.nombreDocumento}</span>
            <span className={DETALLE}>{artefacto.nombreProyecto}</span>
          </>
        );
      },
    },
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
  ];

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
          <p className={TARJETA_NOMBRE}>{nombreDeFila(version)}</p>
          <p className={TARJETA_DATO}>
            {etiquetaVersion(version)} · {formatearFechaCreacion(version.fechaCreacion)}
          </p>
        </>
      )}
    />
  );
}
