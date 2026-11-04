import { Send } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import type { OrdenCampoEntregableEstudiante } from '../../models/OrdenCampoEntregableEstudiante';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const NOMBRE = 'font-medium text-on-surface';
const SECUNDARIO = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEntregableEstudiante {
  return clave === 'versionEntregable' || clave === 'asesorNombre';
}

interface Props {
  entregables: EntregableProyectoGrado[];
  cargando: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEntregableEstudiante, direccion: DireccionOrden) => void;
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
    id: 'version',
    encabezado: 'Versión',
    clave: 'versionEntregable',
    ordenable: true,
    celda: (entregable) => <span className={NOMBRE}>Versión {entregable.versionEntregable}</span>,
  },
  {
    id: 'asesor',
    encabezado: 'Asesor',
    clave: 'asesorNombre',
    ordenable: true,
    celda: (entregable) => <span>{entregable.asesor.nombre}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (entregable) => <InsigniaEstado entregable={entregable} />,
  },
];

const VACIO = (
  <EmptyState
    icono={Send}
    titulo="Aún no hay entregables en tu proyecto"
    descripcion="Cuando tu asesor genere un entregable de tu proyecto de grado, aparecerá aquí."
  />
);

export default function EntregablesEstudianteTable({
  entregables,
  cargando,
  orden,
  onOrdenar,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  return (
    <DataTable
      etiqueta="Entregables"
      columnas={COLUMNAS}
      filas={entregables}
      idDeFila={(entregable) => entregable.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={VACIO}
      tarjeta={(entregable) => (
        <>
          <span className={NOMBRE}>Versión {entregable.versionEntregable}</span>
          <div className={TARJETA_DATOS}>
            <span className={SECUNDARIO}>{entregable.asesor.nombre}</span>
            <InsigniaEstado entregable={entregable} />
          </div>
        </>
      )}
    />
  );
}
