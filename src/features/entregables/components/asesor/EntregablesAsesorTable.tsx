import { SearchX, Send } from 'lucide-react';
import InsigniaProyectoCerrado from '../../../../shared/components/InsigniaProyectoCerrado';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import type { OrdenCampoEntregable } from '../../models/OrdenCampoEntregable';
import type { EstadoProyectoListado } from '../../utils/estado-proyecto';
import AccionesEntregableAsesor from './AccionesEntregableAsesor';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const NOMBRE = 'font-medium text-on-surface';
const VERSION = 'text-on-surface-secondary';

const VACIOS = {
  finalizados: {
    titulo: 'Sin entregables de proyectos finalizados',
    descripcion: 'Cuando uno de tus proyectos de grado finalice, sus entregables aparecerán aquí.',
  },
  activos: {
    titulo: 'Aún no tienes entregables generados',
    descripcion: 'Cuando se genere un entregable de tus proyectos de grado, aparecerá aquí.',
  },
};

function esOrdenCampo(clave: string): clave is OrdenCampoEntregable {
  return clave === 'proyectoGradoNombre' || clave === 'versionEntregable';
}

interface Props {
  entregables: EntregableProyectoGrado[];
  cargando: boolean;
  hayFiltros: boolean;
  estadoProyecto: EstadoProyectoListado;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEntregable, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onCambiarEstado: (entregable: EntregableProyectoGrado) => void;
  onVerArtefactos: (entregable: EntregableProyectoGrado) => void;
  onVerHistorial: (entregable: EntregableProyectoGrado) => void;
  onDescargarPaquete: (entregable: EntregableProyectoGrado) => void;
  descargando: boolean;
}

function InsigniaEstado({ entregable }: { entregable: EntregableProyectoGrado }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variante={varianteEstadoEntregable(entregable.estadoEntregable.id)}>
        {entregable.estadoEntregable.nombre}
      </Badge>
      <InsigniaProyectoCerrado
        proyectoFinalizado={entregable.proyectoFinalizado}
        proyectoCancelado={entregable.proyectoCancelado}
      />
    </div>
  );
}

const COLUMNAS: ColumnaTabla<EntregableProyectoGrado>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'proyectoGradoNombre',
    ordenable: true,
    celda: (entregable) => <span className={NOMBRE}>{entregable.proyectoGrado.nombre}</span>,
  },
  {
    id: 'version',
    encabezado: 'Versión',
    clave: 'versionEntregable',
    ordenable: true,
    celda: (entregable) => <span>Versión {entregable.versionEntregable}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (entregable) => <InsigniaEstado entregable={entregable} />,
  },
];

export default function EntregablesAsesorTable({
  entregables,
  cargando,
  hayFiltros,
  estadoProyecto,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  ...accionesDeFila
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay entregables que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState icono={Send} {...VACIOS[estadoProyecto]} />
  );

  return (
    <DataTable
      etiqueta="Entregables"
      columnas={COLUMNAS}
      filas={entregables}
      idDeFila={(entregable) => entregable.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      acciones={(entregable) => (
        <AccionesEntregableAsesor entregable={entregable} {...accionesDeFila} />
      )}
      tarjeta={(entregable) => (
        <>
          <span className={NOMBRE}>{entregable.proyectoGrado.nombre}</span>
          <div className={TARJETA_DATOS}>
            <span className={VERSION}>Versión {entregable.versionEntregable}</span>
            <InsigniaEstado entregable={entregable} />
          </div>
        </>
      )}
    />
  );
}
