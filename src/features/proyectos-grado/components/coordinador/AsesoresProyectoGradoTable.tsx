import { UserMinus, UserRound } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import { puedeFinalizarse } from '../../utils/asesor-actual';
import {
  AsesorProyectoIdentidad,
  EstadoAsesorProyecto,
  FechaAsignacion,
} from './AsesoresProyectoGradoCeldas';

const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';

function columnas(ultimoRegistroId?: string): ColumnaTabla<AsesorProyectoGrado>[] {
  return [
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
      celda: (asesor) => (
        <EstadoAsesorProyecto asesor={asesor} ultimoRegistro={asesor.id === ultimoRegistroId} />
      ),
    },
    {
      id: 'fecha',
      encabezado: 'Asignado el',
      celda: (asesor) => <FechaAsignacion iso={asesor.fechaAsignado} />,
    },
  ];
}

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
  ultimoRegistroId?: string;
  onFinalizar?: (asesor: AsesorProyectoGrado) => void;
}

export default function AsesoresProyectoGradoTable({
  asesores,
  cargando,
  ultimoRegistroId,
  onFinalizar,
}: Props) {
  return (
    <DataTable
      etiqueta="Asesores del proyecto de grado"
      columnas={columnas(ultimoRegistroId)}
      filas={asesores}
      idDeFila={(asesor) => asesor.id}
      cargando={cargando}
      acciones={
        onFinalizar &&
        ((asesor) =>
          puedeFinalizarse(asesor) ? (
            <RowMenu
              etiqueta={`Acciones de ${asesor.nombre}`}
              acciones={[
                {
                  etiqueta: 'Finalizar participación',
                  icono: UserMinus,
                  peligro: true,
                  onSeleccionar: () => onFinalizar(asesor),
                },
              ]}
            />
          ) : null)
      }
      vacio={VACIO}
      tarjeta={(asesor) => (
        <>
          <AsesorProyectoIdentidad asesor={asesor} />
          <span className={DATO_TARJETA}>Identificador: {asesor.identificador}</span>
          <EstadoAsesorProyecto asesor={asesor} ultimoRegistro={asesor.id === ultimoRegistroId} />
          <span className={DATO_TARJETA}>
            Asignado el <FechaAsignacion iso={asesor.fechaAsignado} />
          </span>
        </>
      )}
    />
  );
}
