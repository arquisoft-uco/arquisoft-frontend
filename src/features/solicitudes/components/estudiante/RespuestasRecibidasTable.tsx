import { Reply } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { varianteEstadoRespuesta } from '../../../../shared/utils/estado-variante';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import FechaSolicitud from '../FechaSolicitud';
import FechaTarjeta from '../FechaTarjeta';
import ParticipanteCelda from '../ParticipanteCelda';

const TEXTO = 'max-w-md break-words text-on-surface-secondary';

function Coordinador({ respuesta }: { respuesta: RespuestaSolicitud }) {
  const { nombre, email } = respuesta.solicitud.destinatario;
  return <ParticipanteCelda nombre={nombre} detalle={email} />;
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
    id: 'coordinador',
    encabezado: 'Coordinador',
    celda: (respuesta) => <Coordinador respuesta={respuesta} />,
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
    encabezado: 'Recibida',
    celda: (respuesta) => <FechaSolicitud iso={respuesta.fechaRespuesta} />,
  },
];

interface Props {
  respuestas: RespuestaSolicitud[];
  cargando: boolean;
}

export default function RespuestasRecibidasTable({ respuestas, cargando }: Props) {
  return (
    <DataTable
      etiqueta="Respuestas de novedades recibidas"
      columnas={COLUMNAS}
      filas={respuestas}
      idDeFila={(respuesta) => respuesta.id}
      cargando={cargando}
      vacio={
        <EmptyState
          icono={Reply}
          titulo="Aún no has recibido respuestas"
          descripcion="Cuando el coordinador responda una de tus novedades, la respuesta aparecerá aquí."
        />
      }
      tarjeta={(respuesta) => (
        <>
          <Coordinador respuesta={respuesta} />
          <p className="break-words text-on-surface-secondary">
            {respuesta.solicitud.mensajeSolicitud}
          </p>
          <p className="break-words">{respuesta.contenido}</p>
          <EstadoRespuesta respuesta={respuesta} />
          <FechaTarjeta iso={respuesta.fechaRespuesta} />
        </>
      )}
    />
  );
}
