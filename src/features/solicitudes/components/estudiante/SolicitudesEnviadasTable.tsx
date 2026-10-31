import { Send, Trash2 } from 'lucide-react';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { Solicitud } from '../../models/Solicitud';
import FechaSolicitud from '../FechaSolicitud';
import FechaTarjeta from '../FechaTarjeta';
import ParticipanteCelda from '../ParticipanteCelda';
import type { TipoSolicitudListadoEnviadoUi } from '../SelectorTipoSolicitud';

const MENSAJE = 'max-w-md break-words text-on-surface-secondary';

const TEXTOS_POR_TIPO: Record<
  TipoSolicitudListadoEnviadoUi,
  { encabezado: string; etiqueta: string; vacio: string }
> = {
  'registro-modificacion-usuarios': {
    encabezado: 'Administrador',
    etiqueta: 'Solicitudes de registro y modificación de usuarios enviadas',
    vacio: 'Cuando envíes una solicitud de registro y modificación de usuarios, aparecerá aquí.',
  },
  coordinador: {
    encabezado: 'Coordinador',
    etiqueta: 'Solicitudes de novedad enviadas al coordinador',
    vacio: 'Cuando envíes una novedad al coordinador, aparecerá aquí.',
  },
  asesor: {
    encabezado: 'Asesor',
    etiqueta: 'Solicitudes de novedad enviadas al asesor',
    vacio: 'Cuando envíes una novedad al asesor, aparecerá aquí.',
  },
  'cambio-asesor': {
    encabezado: 'Destinatario',
    etiqueta: 'Solicitudes de cambio de asesor enviadas',
    vacio: 'Cuando envíes una solicitud de cambio de asesor, aparecerá aquí.',
  },
  'ampliacion-plazo': {
    encabezado: 'Coordinador',
    etiqueta: 'Solicitudes de ampliación de plazo enviadas',
    vacio: 'Cuando envíes una solicitud de ampliación de plazo, aparecerá aquí.',
  },
};

function columnasDe(encabezadoDestinatario: string): ColumnaTabla<Solicitud>[] {
  return [
    {
      id: 'destinatario',
      encabezado: encabezadoDestinatario,
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
}

const COLUMNAS_POR_TIPO: Record<TipoSolicitudListadoEnviadoUi, ColumnaTabla<Solicitud>[]> = {
  'registro-modificacion-usuarios': columnasDe(
    TEXTOS_POR_TIPO['registro-modificacion-usuarios'].encabezado,
  ),
  coordinador: columnasDe(TEXTOS_POR_TIPO.coordinador.encabezado),
  asesor: columnasDe(TEXTOS_POR_TIPO.asesor.encabezado),
  'cambio-asesor': columnasDe(TEXTOS_POR_TIPO['cambio-asesor'].encabezado),
  'ampliacion-plazo': columnasDe(TEXTOS_POR_TIPO['ampliacion-plazo'].encabezado),
};

interface Props {
  tipo: TipoSolicitudListadoEnviadoUi;
  solicitudes: Solicitud[];
  cargando: boolean;
  eliminando?: boolean;
  onEliminar?: (solicitud: Solicitud) => void;
}

export default function SolicitudesEnviadasTable({
  tipo,
  solicitudes,
  cargando,
  eliminando = false,
  onEliminar,
}: Props) {
  const textos = TEXTOS_POR_TIPO[tipo];

  const acciones = onEliminar
    ? (solicitud: Solicitud) => (
        <IconButton
          etiqueta={`Eliminar la solicitud enviada a ${solicitud.destinatario.nombre}`}
          icono={Trash2}
          tono="peligro"
          disabled={eliminando}
          onClick={() => onEliminar(solicitud)}
        />
      )
    : undefined;

  return (
    <DataTable
      etiqueta={textos.etiqueta}
      columnas={COLUMNAS_POR_TIPO[tipo]}
      filas={solicitudes}
      idDeFila={(solicitud) => solicitud.id}
      acciones={acciones}
      encabezadoAcciones="Acciones"
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Send}
          titulo="Aún no has enviado solicitudes"
          descripcion={textos.vacio}
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
