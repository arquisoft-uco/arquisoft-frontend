import { Send } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import type { EstadoEntregable } from '../../models/entregables';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function InsigniaEstado({ estado }: { estado: EstadoEntregable }) {
  return <Badge variante={varianteEstadoEntregable(estado.id)}>{estado.nombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<EstadoEntregable>[] = [
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
  estados: EstadoEntregable[];
  cargando: boolean;
}

export default function EstadosEntregableAsesorTable({ estados, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Estados de un entregable"
      columnas={COLUMNAS}
      filas={estados}
      idDeFila={(estado) => estado.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Send}
          titulo="Aún no hay estados de entregable"
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
