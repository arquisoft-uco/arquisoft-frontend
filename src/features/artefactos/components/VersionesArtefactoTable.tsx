import { FileStack, Info, SearchX } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type { DireccionOrden, OrdenTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import RowMenu from '../../../shared/components/ui/RowMenu';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { construirColumnas, etiquetaVersion } from './columnasVersionesArtefacto';
import InsigniaEstadoRevision from './InsigniaEstadoRevision';

const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props {
  versiones: VersionArtefacto[];
  descripcionVacio: string;
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onVerInformacion: (version: VersionArtefacto) => void;
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
  onVerInformacion,
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
      acciones={(version) => (
        <RowMenu
          etiqueta={`Acciones de la versión ${version.version} de ${version.nombreDocumento}`}
          acciones={[
            {
              etiqueta: 'Ver información',
              icono: Info,
              onSeleccionar: () => onVerInformacion(version),
            },
          ]}
        />
      )}
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
          <InsigniaEstadoRevision version={version} />
        </>
      )}
    />
  );
}
