import { Send, Trash2 } from 'lucide-react';
import Avatar from '../../../../shared/components/ui/Avatar';
import DataTable from '../../../../shared/components/ui/DataTable';
import type { ColumnaTabla } from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { Solicitud } from '../../models/Solicitud';

const FORMATO_FECHA = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';
const MENSAJE = 'max-w-md break-words text-on-surface-secondary';
const FECHA_TARJETA = 'text-[13px] text-on-surface-secondary';

function Destinatario({ solicitud }: { solicitud: Solicitud }) {
  const { nombre, email } = solicitud.destinatario;
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={nombre} />
      <div className={TEXTOS}>
        <span title={nombre} className={NOMBRE}>
          {nombre}
        </span>
        <span title={email} className={SUBTEXTO}>
          {email}
        </span>
      </div>
    </div>
  );
}

function FechaEnvio({ iso }: { iso: string }) {
  const fecha = new Date(iso);
  if (!iso || Number.isNaN(fecha.getTime())) return <span>—</span>;
  return <time dateTime={iso}>{FORMATO_FECHA.format(fecha)}</time>;
}

const COLUMNAS: ColumnaTabla<Solicitud>[] = [
  {
    id: 'destinatario',
    encabezado: 'Coordinador',
    celda: (solicitud) => <Destinatario solicitud={solicitud} />,
  },
  {
    id: 'mensaje',
    encabezado: 'Mensaje',
    celda: (solicitud) => <p className={MENSAJE}>{solicitud.mensajeSolicitud}</p>,
  },
  {
    id: 'fecha',
    encabezado: 'Enviada',
    celda: (solicitud) => <FechaEnvio iso={solicitud.fechaCreacion} />,
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
          <Destinatario solicitud={solicitud} />
          <p className="break-words text-on-surface-secondary">{solicitud.mensajeSolicitud}</p>
          <p className={FECHA_TARJETA}>
            <FechaEnvio iso={solicitud.fechaCreacion} />
          </p>
        </>
      )}
    />
  );
}
