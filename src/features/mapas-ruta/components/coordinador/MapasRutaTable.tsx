import { CalendarClock, Map, Plus, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import type { MapaRuta } from '../../models/MapaRuta';
import type { OrdenCampoMapaRuta } from '../../models/OrdenCampoMapaRuta';
import { formatearFechaCivil } from '../../utils/formato-fecha';

const TITULO = 'font-medium text-on-surface';
const FECHAS = 'text-sm text-on-surface-secondary';

function esOrdenCampo(clave: string): clave is OrdenCampoMapaRuta {
  return clave === 'fechaInicio' || clave === 'fechaFin';
}

interface Props {
  mapas: MapaRuta[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoMapaRuta, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
  onNuevoMapa: () => void;
  onCambiarFechaFin?: (mapa: MapaRuta) => void;
}

const COLUMNAS: ColumnaTabla<MapaRuta>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    celda: (mapa) => <span className={TITULO}>{mapa.titulo}</span>,
  },
  {
    id: 'inicio',
    encabezado: 'Inicio',
    clave: 'fechaInicio',
    ordenable: true,
    celda: (mapa) => formatearFechaCivil(mapa.fechaInicio),
  },
  {
    id: 'fin',
    encabezado: 'Fin',
    clave: 'fechaFin',
    ordenable: true,
    celda: (mapa) => formatearFechaCivil(mapa.fechaFin),
  },
];

export default function MapasRutaTable({
  mapas,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
  onNuevoMapa,
  onCambiarFechaFin,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay mapas de ruta que coincidan con tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={Map}
      titulo="Aún no hay mapas de ruta"
      descripcion="Elige un proyecto en proceso y define sus fechas de inicio y de fin."
      accion={
        <Button icono={Plus} onClick={onNuevoMapa}>
          Nuevo mapa de ruta
        </Button>
      }
    />
  );

  return (
    <DataTable
      etiqueta="Mapas de ruta"
      columnas={COLUMNAS}
      filas={mapas}
      idDeFila={(mapa) => mapa.id}
      orden={orden}
      onOrdenar={ordenar}
      acciones={
        onCambiarFechaFin &&
        ((mapa) => (
          <RowMenu
            etiqueta={`Acciones de ${mapa.titulo}`}
            acciones={[
              {
                etiqueta: 'Cambiar fecha de fin',
                icono: CalendarClock,
                onSeleccionar: () => onCambiarFechaFin(mapa),
              },
            ]}
          />
        ))
      }
      cargando={cargando}
      vacio={vacio}
      tarjeta={(mapa) => (
        <>
          <span className={TITULO}>{mapa.titulo}</span>
          <p className={FECHAS}>Inicio: {formatearFechaCivil(mapa.fechaInicio)}</p>
          <p className={FECHAS}>Fin: {formatearFechaCivil(mapa.fechaFin)}</p>
        </>
      )}
    />
  );
}
