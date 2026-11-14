import { BookOpen, SearchX } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { varianteEstadoDocumentacion } from '../../../shared/utils/estado-variante';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { Documentacion } from '../models/Documentacion';
import type { OrdenCampoDocumentacion } from '../models/OrdenCampoDocumentacion';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const DATO_SECUNDARIO = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoDocumentacion {
  return clave === 'fechaPublicacion';
}

interface Props {
  documentaciones: Documentacion[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoDocumentacion, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

function InsigniaEstado({ documentacion }: { documentacion: Documentacion }) {
  return (
    <Badge variante={varianteEstadoDocumentacion(documentacion.estadoDocumentacion.id)}>
      {documentacion.estadoDocumentacion.nombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<Documentacion>[] = [
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (documentacion) => <InsigniaEstado documentacion={documentacion} />,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    celda: (documentacion) => (
      <span>Versión {documentacion.entregableProyectoGrado.versionEntregable}</span>
    ),
  },
  {
    id: 'bibliotecario',
    encabezado: 'Bibliotecario',
    celda: (documentacion) => <span>{documentacion.bibliotecario.nombre}</span>,
  },
  {
    id: 'fechaPublicacion',
    encabezado: 'Fecha de publicación',
    clave: 'fechaPublicacion',
    ordenable: true,
    celda: (documentacion) => <span>{formatearFechaCreacion(documentacion.fechaPublicacion)}</span>,
  },
];

export default function DocumentacionesTable({
  documentaciones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay documentaciones con el estado elegido."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={BookOpen}
      titulo="Aún no hay documentaciones"
      descripcion="Cuando se publique la documentación de un proyecto de grado, aparecerá aquí."
    />
  );

  // Pendiente: la fila abrirá /biblioteca/doc/:id cuando exista el detalle
  return (
    <DataTable
      etiqueta="Documentaciones"
      columnas={COLUMNAS}
      filas={documentaciones}
      idDeFila={(documentacion) => documentacion.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(documentacion) => (
        <>
          <div className={TARJETA_DATOS}>
            <InsigniaEstado documentacion={documentacion} />
            <span className={DATO_SECUNDARIO}>
              Versión {documentacion.entregableProyectoGrado.versionEntregable}
            </span>
          </div>
          <span className={DATO_SECUNDARIO}>{documentacion.bibliotecario.nombre}</span>
          <span className={DATO_SECUNDARIO}>
            {formatearFechaCreacion(documentacion.fechaPublicacion)}
          </span>
        </>
      )}
    />
  );
}
