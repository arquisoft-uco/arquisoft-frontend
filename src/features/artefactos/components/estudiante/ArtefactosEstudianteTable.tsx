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
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';

const DATO_SECUNDARIO = 'text-on-surface-secondary';
const NOMBRE = 'font-medium text-on-surface';
const TARJETA_NOMBRE = 'font-semibold text-on-surface';
const TARJETA_DATO = 'text-[13px] text-on-surface-secondary';

function etiquetaVersion(artefacto: ArtefactoEstudiante): string {
  return `Versión ${artefacto.versionDocumento}`;
}

const COLUMNAS: ColumnaTabla<ArtefactoEstudiante>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'nombreProyecto',
    ordenable: true,
    celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreProyecto}</span>,
  },
  {
    id: 'documento',
    encabezado: 'Documento',
    clave: 'nombreDocumento',
    ordenable: true,
    celda: (artefacto) => <span className={NOMBRE}>{artefacto.nombreDocumento}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    clave: 'versionDocumento',
    ordenable: true,
    celda: (artefacto) => <Badge variante="neutro">{etiquetaVersion(artefacto)}</Badge>,
  },
  {
    id: 'repositorio',
    encabezado: 'Repositorio',
    clave: 'nombreRepositorio',
    ordenable: true,
    celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreRepositorio}</span>,
  },
  {
    id: 'asesor',
    encabezado: 'Asesor',
    clave: 'nombreAsesor',
    ordenable: true,
    celda: (artefacto) => <span className={DATO_SECUNDARIO}>{artefacto.nombreAsesor}</span>,
  },
];

interface Props {
  artefactos: ArtefactoEstudiante[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (clave: string, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

export default function ArtefactosEstudianteTable({
  artefactos,
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
      columnas={COLUMNAS}
      filas={artefactos}
      idDeFila={(artefacto) => artefacto.id}
      orden={orden}
      onOrdenar={onOrdenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(artefacto) => (
        <>
          <p className={TARJETA_NOMBRE}>{artefacto.nombreDocumento}</p>
          <p className={TARJETA_DATO}>{artefacto.nombreProyecto}</p>
          <p className={TARJETA_DATO}>{artefacto.nombreRepositorio}</p>
          <p className={TARJETA_DATO}>
            {artefacto.nombreAsesor} · {etiquetaVersion(artefacto)}
          </p>
        </>
      )}
    />
  );
}
