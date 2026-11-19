import { BookOpen, SearchX } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { formatearFechaCreacion } from '../../../shared/utils/formato-version';
import type { Documentacion } from '../models/Documentacion';
import type { OrdenCampoDocumentacion } from '../models/OrdenCampoDocumentacion';
import type { DestinoEstadoDocumentacion } from '../utils/transiciones-estado-documentacion';
import AccionesDocumentacion from './AccionesDocumentacion';
import { AutoresProyecto, InsigniaEstado, TituloProyecto } from './DocumentacionCeldas';
import TarjetaDocumentacion from './TarjetaDocumentacion';

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
  onVerAutores?: (documentacion: Documentacion) => void;
  onCambiarEstado?: (documentacion: Documentacion, destino: DestinoEstadoDocumentacion) => void;
  onDescargar?: (documentacion: Documentacion) => void;
  descargando?: boolean;
  onCompartir?: (documentacion: Documentacion) => void;
  compartiendo?: boolean;
}

const COLUMNAS: ColumnaTabla<Documentacion>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    celda: (documentacion) => (
      <div className="flex flex-col">
        <TituloProyecto titulo={documentacion.tituloProyecto} />
        <span className="text-[13px] text-on-surface-secondary">
          Versión {documentacion.entregableProyectoGrado.versionEntregable}
        </span>
      </div>
    ),
  },
  {
    id: 'autores',
    encabezado: 'Autores',
    celda: (documentacion) => <AutoresProyecto autores={documentacion.autores} />,
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
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (documentacion) => <InsigniaEstado documentacion={documentacion} />,
  },
];

export default function DocumentacionesTable({
  documentaciones,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onVerAutores,
  onCambiarEstado,
  onDescargar,
  descargando,
  onCompartir,
  compartiendo,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const propsAcciones = {
    onVerAutores,
    onCambiarEstado,
    onDescargar,
    descargando,
    onCompartir,
    compartiendo,
  };

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
      acciones={
        (onVerAutores || onCambiarEstado || onDescargar || onCompartir) &&
        ((documentacion) => (
          <AccionesDocumentacion documentacion={documentacion} {...propsAcciones} />
        ))
      }
      tarjeta={(documentacion) => <TarjetaDocumentacion documentacion={documentacion} />}
    />
  );
}
