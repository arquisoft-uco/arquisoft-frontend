import { Send } from 'lucide-react';
import InsigniaProyectoCerrado from '../../../../shared/components/InsigniaProyectoCerrado';
import { accionDescargar } from '../../../../shared/components/accionDescargar';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import type { OrdenCampoEntregableEstudiante } from '../../models/OrdenCampoEntregableEstudiante';
import type { EstadoProyectoListado } from '../../utils/estado-proyecto';
import { puedeDescargarPaquete } from '../../utils/estado-proyecto';

const TARJETA_DATOS = 'flex flex-wrap items-center gap-1.5';
const NOMBRE = 'font-medium text-on-surface';
const SECUNDARIO = 'text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoEntregableEstudiante {
  return clave === 'versionEntregable' || clave === 'asesorNombre';
}

interface Props {
  entregables: EntregableProyectoGrado[];
  cargando: boolean;
  estadoProyecto: EstadoProyectoListado;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoEntregableEstudiante, direccion: DireccionOrden) => void;
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

export default function EntregablesEstudianteTable({
  entregables,
  cargando,
  estadoProyecto,
  orden,
  onOrdenar,
  onDescargarPaquete,
  descargando,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio =
    estadoProyecto === 'finalizados' ? (
      <EmptyState
        icono={Send}
        titulo="Sin entregables de proyectos finalizados"
        descripcion="Cuando finalice tu proyecto de grado, sus entregables aparecerán aquí."
      />
    ) : (
      <EmptyState
        icono={Send}
        titulo="Aún no hay entregables en tu proyecto"
        descripcion="Cuando tu asesor genere un entregable de tu proyecto de grado, aparecerá aquí."
      />
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
        <RowMenu
          etiqueta={`Acciones del entregable versión ${entregable.versionEntregable}`}
          acciones={[
            accionDescargar({
              etiqueta: 'Descargar paquete',
              onSeleccionar: () => onDescargarPaquete(entregable),
              deshabilitada: !puedeDescargarPaquete(entregable) || descargando,
            }),
          ]}
        />
      )}
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
