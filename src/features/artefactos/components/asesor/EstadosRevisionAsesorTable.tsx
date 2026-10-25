import { ClipboardList } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoRevisionAsesor } from '../../../../shared/utils/estado-variante';
import type { EstadoRevisionAsesor } from '../../models/artefactos';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function InsigniaEstado({ estado }: { estado: EstadoRevisionAsesor }) {
  return <Badge variante={varianteEstadoRevisionAsesor(estado.id)}>{estado.nombre}</Badge>;
}

const COLUMNAS: ColumnaTabla<EstadoRevisionAsesor>[] = [
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
  estados: EstadoRevisionAsesor[];
  cargando: boolean;
}

export default function EstadosRevisionAsesorTable({ estados, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Estados de una revisión del asesor"
      columnas={COLUMNAS}
      filas={estados}
      idDeFila={(estado) => estado.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={ClipboardList}
          titulo="Aún no hay estados de revisión"
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
