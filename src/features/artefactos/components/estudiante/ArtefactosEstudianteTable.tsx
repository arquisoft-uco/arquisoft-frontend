import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { DireccionOrden, OrdenTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import InsigniaEstadoUltimaRevision from '../InsigniaEstadoUltimaRevision';
import InsigniaOmitido from '../InsigniaOmitido';
import ProyectoConInsignia from '../ProyectoConInsignia';
import { columnasArtefactosEstudiante } from './columnasArtefactosEstudiante';
import MenuDescargarArtefacto from './MenuDescargarArtefacto';

const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

interface Props {
  artefactos: ArtefactoEstudiante[];
  estados: EstadoRevisionAsesor[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function ArtefactosEstudianteTable({
  artefactos,
  estados,
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
      descripcion="No hay artefactos que coincidan con los filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={FileStack}
      titulo="Aún no hay artefactos en tus proyectos"
      descripcion="Aparecerán aquí cuando tus proyectos de grado tengan artefactos."
    />
  );

  return (
    <DataTable
      etiqueta="Artefactos de mis proyectos de grado"
      columnas={columnasArtefactosEstudiante(estados)}
      filas={artefactos}
      idDeFila={(artefacto) => artefacto.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      acciones={(artefacto) => <MenuDescargarArtefacto artefacto={artefacto} />}
      encabezadoAcciones="Acciones"
      tarjeta={(artefacto) => (
        <>
          <p className={TARJETA_NOMBRE}>{artefacto.nombreDocumento}</p>
          {artefacto.omitido && <InsigniaOmitido />}
          <p className={TARJETA_DATO}>
            <ProyectoConInsignia proyecto={artefacto} />
          </p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>
            {artefacto.nombreAsesor} · Versión {artefacto.versionDocumento} del documento
          </p>
          <InsigniaEstadoUltimaRevision estado={artefacto.estadoUltimaRevision} estados={estados} />
        </>
      )}
    />
  );
}
