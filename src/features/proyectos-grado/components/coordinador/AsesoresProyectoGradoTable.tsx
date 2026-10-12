import { UserRound } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import {
  AsesorProyectoIdentidad,
  EstadoAsesorProyecto,
  FechaAsignacion,
} from './AsesoresProyectoGradoCeldas';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

const COLUMNAS: ColumnaTabla<AsesorProyectoGrado>[] = [
  {
    id: 'asesor',
    encabezado: 'Asesor',
    celda: (asesor) => <AsesorProyectoIdentidad asesor={asesor} />,
  },
  {
    id: 'identificador',
    encabezado: 'Identificador',
    celda: (asesor) => <span>{asesor.identificador}</span>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (asesor) => <EstadoAsesorProyecto asesor={asesor} />,
  },
  {
    id: 'fecha',
    encabezado: 'Asignado el',
    celda: (asesor) => <FechaAsignacion iso={asesor.fechaAsignado} />,
  },
];

const VACIO = (
  <EmptyState
    icono={UserRound}
    titulo="Este proyecto aún no tiene asesores"
    descripcion="Aparecerán aquí cuando se asigne un asesor."
  />
);

interface Props {
  asesores: AsesorProyectoGrado[];
  cargando: boolean;
}

export default function AsesoresProyectoGradoTable({ asesores, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Asesores del proyecto de grado"
      columnas={COLUMNAS}
      filas={asesores}
      idDeFila={(asesor) => asesor.id}
      cargando={cargando}
      vacio={VACIO}
      tarjeta={(asesor) => (
        <>
          <AsesorProyectoIdentidad asesor={asesor} />
          <span className={DATO_TARJETA}>Identificador: {asesor.identificador}</span>
          <EstadoAsesorProyecto asesor={asesor} />
          <span className={DATO_TARJETA}>
            Asignado el <FechaAsignacion iso={asesor.fechaAsignado} />
          </span>
        </>
      )}
    />
  );
}
