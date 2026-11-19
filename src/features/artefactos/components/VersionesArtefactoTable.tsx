import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type { DireccionOrden, OrdenTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import type { AccionMenu } from '../../../shared/components/ui/RowMenu';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { construirColumnas, etiquetaVersion } from './columnasVersionesArtefacto';
import InsigniaEstadoRevision from './InsigniaEstadoRevision';
import InsigniaProyectoCerrado from '../../../shared/components/InsigniaProyectoCerrado';
import VersionArtefactoRowMenu from './VersionArtefactoRowMenu';

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
  mostrarRepositorio?: boolean;
  etiquetaFecha?: string;
  accionesAdicionales?: (version: VersionArtefacto) => AccionMenu[];
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
  mostrarRepositorio = true,
  etiquetaFecha,
  accionesAdicionales,
}: Props) {
  const columnas = construirColumnas({ mostrarAsesor, mostrarRepositorio, etiquetaFecha });

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
        <VersionArtefactoRowMenu
          version={version}
          onVerInformacion={onVerInformacion}
          accionesAdicionales={accionesAdicionales}
        />
      )}
      tarjeta={(version) => (
        <>
          <p className={TARJETA_NOMBRE}>{version.nombreDocumento}</p>
          <p className={TARJETA_DATO}>
            {version.nombreProyecto}
            {mostrarRepositorio && ` · ${version.nombreRepositorio}`}
          </p>
          <InsigniaProyectoCerrado
            proyectoFinalizado={version.proyectoFinalizado}
            proyectoCancelado={version.proyectoCancelado}
          />
          <p className={TARJETA_DATO}>
            {etiquetaVersion(version)} · {formatearFechaCreacion(version.fechaCreacion)}
          </p>
          {mostrarAsesor && <p className={TARJETA_DATO}>{version.nombreAsesor}</p>}
          {version.fechaCreacionRevision !== null && (
            <p className={TARJETA_DATO}>
              Revisión: {formatearFechaCreacion(version.fechaCreacionRevision)}
            </p>
          )}
          <InsigniaEstadoRevision version={version} />
        </>
      )}
    />
  );
}
