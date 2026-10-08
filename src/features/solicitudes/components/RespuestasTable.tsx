import type { ReactNode } from 'react';
import { Reply } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import DataTable from '../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { varianteEstadoRespuesta } from '../../../shared/utils/estado-variante';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import FechaSolicitud from './FechaSolicitud';
import FechaTarjeta from './FechaTarjeta';

const TEXTO = 'max-w-md break-words text-on-surface-secondary';

function EstadoRespuesta({ respuesta }: { respuesta: RespuestaSolicitud }) {
  return (
    <Badge variante={varianteEstadoRespuesta(respuesta.estadoRespuestaId)}>
      {respuesta.estadoRespuestaNombre}
    </Badge>
  );
}

interface Props {
  respuestas: RespuestaSolicitud[];
  cargando: boolean;
  etiqueta: string;
  participante: { encabezado: string; celda: (respuesta: RespuestaSolicitud) => ReactNode };
  encabezadoFecha: string;
  vacio: { titulo: string; descripcion: string };
}

export default function RespuestasTable({
  respuestas,
  cargando,
  etiqueta,
  participante,
  encabezadoFecha,
  vacio,
}: Props) {
  const columnas: ColumnaTabla<RespuestaSolicitud>[] = [
    { id: 'participante', encabezado: participante.encabezado, celda: participante.celda },
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
      encabezado: encabezadoFecha,
      celda: (respuesta) => <FechaSolicitud iso={respuesta.fechaRespuesta} />,
    },
  ];

  return (
    <DataTable
      etiqueta={etiqueta}
      columnas={columnas}
      filas={respuestas}
      idDeFila={(respuesta) => respuesta.id}
      cargando={cargando}
      vacio={<EmptyState icono={Reply} titulo={vacio.titulo} descripcion={vacio.descripcion} />}
      tarjeta={(respuesta) => (
        <>
          {participante.celda(respuesta)}
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
