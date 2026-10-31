import { Inbox, Reply } from 'lucide-react';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import IconButton from '../../../shared/components/ui/IconButton';
import type { Solicitud } from '../models/Solicitud';
import FechaSolicitud from './FechaSolicitud';
import FechaTarjeta from './FechaTarjeta';
import ParticipanteCelda from './ParticipanteCelda';
import type {
  TipoSolicitudListadoRecibidoUi,
  TipoSolicitudRecibidaUi,
} from './SelectorTipoSolicitud';

type ReceptorConRespuesta = 'coordinador' | 'asesor';
export type ReceptorSolicitud = ReceptorConRespuesta | 'administrador';

const DESCRIPCION_VACIO_CAMBIO_ASESOR =
  'Cuando un estudiante solicite un cambio de asesor, aparecerá aquí.';

const DESCRIPCION_VACIO_AMPLIACION_PLAZO =
  'Cuando un estudiante solicite una ampliación de plazo, aparecerá aquí.';

const DESCRIPCION_VACIO: Record<TipoSolicitudRecibidaUi, Record<ReceptorConRespuesta, string>> = {
  novedad: {
    coordinador: 'Cuando alguien te envíe una novedad, aparecerá aquí.',
    asesor: 'Cuando un estudiante te envíe una novedad, aparecerá aquí.',
  },
  'cambio-asesor': {
    coordinador: DESCRIPCION_VACIO_CAMBIO_ASESOR,
    asesor: DESCRIPCION_VACIO_CAMBIO_ASESOR,
  },
  'ampliacion-plazo': {
    coordinador: DESCRIPCION_VACIO_AMPLIACION_PLAZO,
    asesor: DESCRIPCION_VACIO_AMPLIACION_PLAZO,
  },
};

const DESCRIPCION_VACIO_REGISTRO_MODIFICACION_USUARIOS =
  'Cuando un coordinador solicite registrar o modificar usuarios, aparecerá aquí.';

function descripcionVacio(tipo: TipoSolicitudListadoRecibidoUi, receptor: ReceptorSolicitud) {
  if (tipo === 'registro-modificacion-usuarios') {
    return DESCRIPCION_VACIO_REGISTRO_MODIFICACION_USUARIOS;
  }
  return DESCRIPCION_VACIO[tipo][receptor === 'asesor' ? 'asesor' : 'coordinador'];
}

const ETIQUETA_TABLA: Record<TipoSolicitudListadoRecibidoUi, string> = {
  novedad: 'Solicitudes de novedad recibidas',
  'cambio-asesor': 'Solicitudes de cambio de asesor recibidas',
  'ampliacion-plazo': 'Solicitudes de ampliación de plazo recibidas',
  'registro-modificacion-usuarios': 'Solicitudes de registro y modificación de usuarios recibidas',
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
  tipo?: TipoSolicitudListadoRecibidoUi;
  onResponder?: (solicitud: Solicitud) => void;
}

export default function SolicitudesRecibidasTable({
  solicitudes,
  cargando,
  receptor,
  tipo = 'novedad',
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
      etiqueta={ETIQUETA_TABLA[tipo]}
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
          descripcion={descripcionVacio(tipo, receptor)}
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
