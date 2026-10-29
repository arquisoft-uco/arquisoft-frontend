import { ListChecks, SearchX } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoTarea } from '../../../../shared/utils/estado-variante';
import type { OrdenCampoTarea } from '../../models/OrdenCampoTarea';
import type { Tarea } from '../../models/Tarea';

const TITULO = 'font-medium text-on-surface';
const SUBTEXTO = 'text-[13px] text-on-surface-secondary';
const CELDA_ASESOR = 'flex flex-col';
const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';

function esOrdenCampo(clave: string): clave is OrdenCampoTarea {
  return clave === 'descripcion';
}

interface Props {
  tareas: Tarea[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoTarea, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

function InsigniaEstado({ tarea }: { tarea: Tarea }) {
  return <Badge variante={varianteEstadoTarea(tarea.estado.id)}>{tarea.estado.nombre}</Badge>;
}

function DatosAsesor({ tarea }: { tarea: Tarea }) {
  return (
    <span className={CELDA_ASESOR}>
      <span className="text-on-surface">{tarea.asesor.nombre}</span>
      <span className={SUBTEXTO}>{tarea.asesor.email}</span>
    </span>
  );
}

const COLUMNAS: ColumnaTabla<Tarea>[] = [
  {
    id: 'descripcion',
    encabezado: 'Tarea',
    clave: 'descripcion',
    ordenable: true,
    celda: (tarea) => <span className={TITULO}>{tarea.descripcion}</span>,
  },
  {
    id: 'asesor',
    encabezado: 'Asesor',
    celda: (tarea) => <DatosAsesor tarea={tarea} />,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (tarea) => <InsigniaEstado tarea={tarea} />,
  },
];

export default function TareasMapaRutaTable({
  tareas,
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
      descripcion="No hay tareas que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={ListChecks}
      titulo="Aún no hay tareas"
      descripcion="Cuando se asignen tareas a tu mapa de ruta, aparecerán aquí."
    />
  );

  return (
    <DataTable
      etiqueta="Tareas del mapa de ruta"
      columnas={COLUMNAS}
      filas={tareas}
      idDeFila={(tarea) => tarea.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(tarea) => (
        <>
          <span className={TITULO}>{tarea.descripcion}</span>
          <DatosAsesor tarea={tarea} />
          <div className={TARJETA_ESTADO}>
            <InsigniaEstado tarea={tarea} />
          </div>
        </>
      )}
    />
  );
}
