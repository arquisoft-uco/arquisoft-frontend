import { Inbox, Reply } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { Solicitud } from '../models/Solicitud';
import FechaSolicitud from './FechaSolicitud';
import FechaTarjeta from './FechaTarjeta';
import ParticipanteCelda from './ParticipanteCelda';

export type ReceptorSolicitud = 'coordinador' | 'asesor';

const DESCRIPCION_VACIO: Record<ReceptorSolicitud, string> = {
  coordinador: 'Cuando alguien te envíe una novedad, aparecerá aquí.',
  asesor: 'Cuando un estudiante te envíe una novedad, aparecerá aquí.',
};

const MENSAJE = 'max-w-md break-words text-on-surface-secondary';

function Remitente({ solicitud }: { solicitud: Solicitud }) {
  const { nombre, identificador, email } = solicitud.remitente;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

const COLUMNAS: ColumnaTabla<Solicitud>[] = [
  {
    id: 'remitente',
    encabezado: 'Remitente',
    celda: (solicitud) => <Remitente solicitud={solicitud} />,
  },
  {
    id: 'mensaje',
    encabezado: 'Mensaje',
    celda: (solicitud) => <p className={MENSAJE}>{solicitud.mensajeSolicitud}</p>,
  },
  {
    id: 'fecha',
    encabezado: 'Recibida',
    celda: (solicitud) => <FechaSolicitud iso={solicitud.fechaCreacion} />,
  },
];

interface Props {
  solicitudes: Solicitud[];
  cargando: boolean;
  receptor: ReceptorSolicitud;
  onResponder?: (solicitud: Solicitud) => void;
}

export default function SolicitudesRecibidasTable({
  solicitudes,
  cargando,
  receptor,
  onResponder,
}: Props) {
  function acciones(solicitud: Solicitud) {
    return (
      <IconButton
        etiqueta={`Responder la solicitud de ${solicitud.remitente.nombre}`}
        icono={Reply}
        tono="primario"
        rotulo="Responder"
        onClick={() => onResponder?.(solicitud)}
      />
    );
  }

  return (
    <DataTable
      etiqueta="Solicitudes de novedad recibidas"
      columnas={COLUMNAS}
      filas={solicitudes}
      idDeFila={(solicitud) => solicitud.id}
      acciones={onResponder ? acciones : undefined}
      encabezadoAcciones="Acciones"
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Inbox}
          titulo="Aún no has recibido solicitudes"
          descripcion={DESCRIPCION_VACIO[receptor]}
        />
      }
      tarjeta={(solicitud) => (
        <>
          <Remitente solicitud={solicitud} />
          <p className="break-words text-on-surface-secondary">{solicitud.mensajeSolicitud}</p>
          <FechaTarjeta iso={solicitud.fechaCreacion} />
        </>
      )}
    />
  );
}
