import { GraduationCap, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenCampoProyectoGrado } from '../../models/OrdenCampoProyectoGrado';
import type { ProyectoGrado } from '../../models/ProyectoGrado';
import { InsigniaEstadoProyecto, TituloProyecto } from '../coordinador/ProyectoGradoCeldas';

const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';

function esOrdenCampo(clave: string): clave is OrdenCampoProyectoGrado {
  return clave === 'tituloProyecto';
}

interface Props {
  proyectos: ProyectoGrado[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoProyectoGrado, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

function TituloDetalle({ proyecto }: { proyecto: ProyectoGrado }) {
  return (
    <TituloProyecto
      proyecto={proyecto}
      destino=""
      etiquetaAccesible={`Ver el detalle de ${proyecto.tituloProyecto}`}
    />
  );
}

const COLUMNAS: ColumnaTabla<ProyectoGrado>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'tituloProyecto',
    ordenable: true,
    celda: (proyecto) => <TituloDetalle proyecto={proyecto} />,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (proyecto) => (
      <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
    ),
  },
];

export default function ProyectosGradoAsesorTable({
  proyectos,
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
      descripcion="No hay proyectos que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={GraduationCap}
      titulo="Aún no tienes proyectos de grado asignados"
      descripcion="Aparecerán aquí cuando el coordinador te asigne como asesor de un proyecto."
    />
  );

  return (
    <DataTable
      etiqueta="Proyectos de grado"
      columnas={COLUMNAS}
      filas={proyectos}
      idDeFila={(proyecto) => proyecto.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(proyecto) => (
        <>
          <TituloDetalle proyecto={proyecto} />
          <div className={TARJETA_ESTADO}>
            <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
          </div>
        </>
      )}
    />
  );
}
