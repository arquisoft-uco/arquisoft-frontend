import { UserCheck } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoAsesorProyecto } from '../../../../shared/utils/estado-variante';
import type { EstadoAsesorProyectoGrado } from '../../models/EstadoAsesorProyectoGrado';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function InsigniaEstado({ estado }: { estado: EstadoAsesorProyectoGrado }) {
  return <Badge variante={varianteEstadoAsesorProyecto(estado.id)}>{estado.nombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<EstadoAsesorProyectoGrado>[] = [
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (estado) => <InsigniaEstado estado={estado} />,
  },
  {
    id: 'descripcion',
    encabezado: 'Descripción',
    celda: (estado) => <span>{estado.descripcion}</span>,
  },
];

interface Props {
  estados: EstadoAsesorProyectoGrado[];
  cargando: boolean;
}

export default function EstadosAsesorProyectoGradoTable({ estados, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Estados posibles de un asesor del proyecto de grado"
      columnas={COLUMNAS}
      filas={estados}
      idDeFila={(estado) => estado.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={UserCheck}
          titulo="Aún no hay estados de asesor"
          descripcion="Cuando estén disponibles, aparecerán aquí."
        />
      }
      tarjeta={(estado) => (
        <>
          <div>
            <InsigniaEstado estado={estado} />
          </div>
          <p className={DATO_TARJETA}>{estado.descripcion}</p>
        </>
      )}
    />
  );
}
