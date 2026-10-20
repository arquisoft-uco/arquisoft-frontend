import type { ReactNode } from 'react';
import { Reply, SearchX } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import DataTable from '../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../shared/components/ui/DataTable';
import EmptyState from '../../../shared/components/ui/EmptyState';
import { varianteEstadoRespuesta } from '../../../shared/utils/estado-variante';
import type { OrdenCampoRespuesta } from '../models/ParametrosRespuestas';
import type { RespuestaSolicitud } from '../models/RespuestaSolicitud';
import FechaSolicitud from './FechaSolicitud';
import FechaTarjeta from './FechaTarjeta';

const TEXTO = 'max-w-md break-words text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoRespuesta {
  return clave === 'fechaRespuesta' || clave === 'destinatarioNombre';
}

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
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoRespuesta, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  participante: {
    encabezado: string;
    celda: (respuesta: RespuestaSolicitud) => ReactNode;
    claveOrden?: OrdenCampoRespuesta;
  };
  encabezadoFecha: string;
  vacio: { titulo: string; descripcion: string };
  acciones?: (respuesta: RespuestaSolicitud) => ReactNode;
}

export default function RespuestasTable({
  respuestas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  etiqueta,
  participante,
  encabezadoFecha,
  vacio,
  acciones,
}: Props) {
  const columnas: ColumnaTabla<RespuestaSolicitud>[] = [
    {
      id: 'participante',
      encabezado: participante.encabezado,
      clave: participante.claveOrden,
      ordenable: participante.claveOrden !== undefined,
      celda: participante.celda,
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
      encabezado: encabezadoFecha,
      clave: 'fechaRespuesta',
      ordenable: true,
      celda: (respuesta) => <FechaSolicitud iso={respuesta.fechaRespuesta} />,
    },
  ];

  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const sinFilas = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay respuestas que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState icono={Reply} titulo={vacio.titulo} descripcion={vacio.descripcion} />
  );

  return (
    <DataTable
      etiqueta={etiqueta}
      columnas={columnas}
      filas={respuestas}
      acciones={acciones}
      encabezadoAcciones={acciones ? 'Acciones' : undefined}
      idDeFila={(respuesta) => respuesta.id}
      cargando={cargando}
      orden={orden}
      onOrdenar={ordenar}
      vacio={sinFilas}
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
