import { Send, Trash2 } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { Solicitud } from '../../models/Solicitud';
import FechaSolicitud from '../FechaSolicitud';
import FechaTarjeta from '../FechaTarjeta';
import ParticipanteCelda from '../ParticipanteCelda';

const MENSAJE = 'max-w-md break-words text-on-surface-secondary';

const COLUMNAS: ColumnaTabla<Solicitud>[] = [
  {
    id: 'destinatario',
    encabezado: 'Coordinador',
    celda: (solicitud) => (
      <ParticipanteCelda
        nombre={solicitud.destinatario.nombre}
        detalle={solicitud.destinatario.email}
      />
    ),
  },
  {
    id: 'mensaje',
    encabezado: 'Mensaje',
    celda: (solicitud) => <p className={MENSAJE}>{solicitud.mensajeSolicitud}</p>,
  },
  {
    id: 'fecha',
    encabezado: 'Enviada',
    celda: (solicitud) => <FechaSolicitud iso={solicitud.fechaCreacion} />,
  },
];

interface Props {
  solicitudes: Solicitud[];
  cargando: boolean;
  eliminando: boolean;
  onEliminar: (solicitud: Solicitud) => void;
}

export default function SolicitudesEnviadasTable({
  solicitudes,
  cargando,
  eliminando,
  onEliminar,
}: Props) {
  function acciones(solicitud: Solicitud) {
    return (
      <IconButton
        etiqueta={`Eliminar la solicitud enviada a ${solicitud.destinatario.nombre}`}
        icono={Trash2}
        tono="peligro"
        disabled={eliminando}
        onClick={() => onEliminar(solicitud)}
      />
    );
  }

  return (
    <DataTable
      etiqueta="Solicitudes de novedad enviadas al coordinador"
      columnas={COLUMNAS}
      filas={solicitudes}
      idDeFila={(solicitud) => solicitud.id}
      acciones={acciones}
      encabezadoAcciones="Acciones"
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Send}
          titulo="Aún no has enviado solicitudes"
          descripcion="Cuando envíes una novedad al coordinador, aparecerá aquí."
        />
      }
      tarjeta={(solicitud) => (
        <>
          <ParticipanteCelda
            nombre={solicitud.destinatario.nombre}
            detalle={solicitud.destinatario.email}
          />
          <p className="break-words text-on-surface-secondary">{solicitud.mensajeSolicitud}</p>
          <FechaTarjeta iso={solicitud.fechaCreacion} />
        </>
      )}
    />
  );
}
