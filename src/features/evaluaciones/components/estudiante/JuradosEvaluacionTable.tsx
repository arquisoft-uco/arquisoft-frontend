import type { ReactNode } from 'react';
import { SearchX, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

const NOMBRE = 'font-medium text-on-surface';
const CORREO = 'text-[13px] text-on-surface-secondary';

const COLUMNAS: ColumnaTabla<EvaluacionJurado>[] = [
  {
    id: 'jurado',
    encabezado: 'Jurado',
    clave: 'jurado',
    ordenable: true,
    celda: (fila) => <span className={NOMBRE}>{fila.jurado.nombre}</span>,
  },
  {
    id: 'correo',
    encabezado: 'Correo',
    celda: (fila) => fila.jurado.email,
  },
];

interface Props {
  jurados: EvaluacionJurado[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  acciones?: (jurado: EvaluacionJurado) => ReactNode;
  encabezadoAcciones?: string;
}

export default function JuradosEvaluacionTable({
  jurados,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  acciones,
  encabezadoAcciones,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (clave === 'jurado') onOrdenar(direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay jurados que coincidan con tu búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={Users}
      titulo="Aún no hay jurados asignados"
      descripcion="Aparecerán aquí cuando el coordinador asigne jurados a esta evaluación."
    />
  );

  return (
    <DataTable
      etiqueta="Jurados de la evaluación"
      columnas={COLUMNAS}
      filas={jurados}
      idDeFila={(fila) => fila.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={acciones}
      encabezadoAcciones={encabezadoAcciones}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(fila) => (
        <>
          <span className={NOMBRE}>{fila.jurado.nombre}</span>
          <span className={CORREO}>{fila.jurado.email}</span>
        </>
      )}
    />
  );
}
