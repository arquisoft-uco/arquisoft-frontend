import { Reply } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoRespuesta } from '../../../../shared/utils/estado-variante';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import FechaSolicitud from '../FechaSolicitud';
import ParticipanteCelda from '../ParticipanteCelda';

const TEXTO = 'max-w-md break-words text-on-surface-secondary';
const FECHA_TARJETA = 'text-[13px] text-on-surface-secondary';

function Estudiante({ respuesta }: { respuesta: RespuestaSolicitud }) {
  const { nombre, identificador, email } = respuesta.solicitud.remitente;
  return <ParticipanteCelda nombre={nombre} detalle={`${identificador} · ${email}`} />;
}

function EstadoRespuesta({ respuesta }: { respuesta: RespuestaSolicitud }) {
  return (
    <Badge variante={varianteEstadoRespuesta(respuesta.estadoRespuestaId)}>
      {respuesta.estadoRespuestaNombre}
    </Badge>
  );
}

const COLUMNAS: ColumnaTabla<RespuestaSolicitud>[] = [
  {
    id: 'estudiante',
    encabezado: 'Estudiante',
    celda: (respuesta) => <Estudiante respuesta={respuesta} />,
  },
  {
    id: 'mensaje',
    encabezado: 'Mensaje',
    celda: (respuesta) => <p className={TEXTO}>{respuesta.solicitud.mensajeSolicitud}</p>,
  },
  {
    id: 'respuesta',
    encabezado: 'Respuesta',
    celda: (respuesta) => <p className={TEXTO}>{respuesta.contenido}</p>,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (respuesta) => <EstadoRespuesta respuesta={respuesta} />,
  },
  {
    id: 'fecha',
    encabezado: 'Respondida',
    celda: (respuesta) => <FechaSolicitud iso={respuesta.fechaRespuesta} />,
  },
];

interface Props {
  respuestas: RespuestaSolicitud[];
  cargando: boolean;
}

export default function RespuestasEnviadasTable({ respuestas, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Respuestas de novedades enviadas"
      columnas={COLUMNAS}
      filas={respuestas}
      idDeFila={(respuesta) => respuesta.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Reply}
          titulo="Aún no has enviado respuestas"
          descripcion="Cuando respondas una novedad desde Recibidas, la respuesta aparecerá aquí."
        />
      }
      tarjeta={(respuesta) => (
        <>
          <Estudiante respuesta={respuesta} />
          <p className="break-words text-on-surface-secondary">
            {respuesta.solicitud.mensajeSolicitud}
          </p>
          <p className="break-words">{respuesta.contenido}</p>
          <EstadoRespuesta respuesta={respuesta} />
          <p className={FECHA_TARJETA}>
            <FechaSolicitud iso={respuesta.fechaRespuesta} />
          </p>
        </>
      )}
    />
  );
}
