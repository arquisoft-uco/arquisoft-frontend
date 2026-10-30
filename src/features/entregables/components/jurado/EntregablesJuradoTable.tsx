import { SearchX, Send } from 'lucide-react';
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
import type { OrdenCampoEntregableJurado } from '../../models/OrdenCampoEntregableJurado';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const NOMBRE = 'font-medium text-on-surface';
const SECUNDARIO = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEntregableJurado {
  return (
    clave === 'proyectoGradoNombre' || clave === 'asesorNombre' || clave === 'versionEntregable'
  );
}

interface Props {
  entregables: EntregableProyectoGrado[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEntregableJurado, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

function InsigniaEstado({ entregable }: { entregable: EntregableProyectoGrado }) {
  return (
    <Badge variante={varianteEstadoEntregable(entregable.estadoEntregable.id)}>
      {entregable.estadoEntregable.nombre}
    </Badge>
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
    id: 'asesor',
    encabezado: 'Asesor',
    clave: 'asesorNombre',
    ordenable: true,
    celda: (entregable) => <span>{entregable.asesor.nombre}</span>,
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

export default function EntregablesJuradoTable({
  entregables,
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
      descripcion="No hay entregables que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={Send}
      titulo="Aún no hay entregables por evaluar"
      descripcion="Cuando un entregable quede disponible para evaluación, aparecerá aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Entregables por evaluar"
      columnas={COLUMNAS}
      filas={entregables}
      idDeFila={(entregable) => entregable.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(entregable) => (
        <>
          <span className={NOMBRE}>{entregable.proyectoGrado.nombre}</span>
          <span className={SECUNDARIO}>{entregable.asesor.nombre}</span>
          <div className={TARJETA_DATOS}>
            <span className={SECUNDARIO}>Versión {entregable.versionEntregable}</span>
            <InsigniaEstado entregable={entregable} />
          </div>
        </>
      )}
    />
  );
}
