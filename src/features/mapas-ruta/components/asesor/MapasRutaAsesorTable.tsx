import { Map, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { ProyectoAsesorado } from '../../models/ProyectoAsesorado';
import AccionesProyectoAsesorado from './AccionesProyectoAsesorado';
import EnlaceProyectoAsesorado from './EnlaceProyectoAsesorado';
import MapaRutaProyectoCelda from './MapaRutaProyectoCelda';

type OrdenCampoProyectoAsesorado = 'tituloProyecto';

function esOrdenCampo(clave: string): clave is OrdenCampoProyectoAsesorado {
  return clave === 'tituloProyecto';
}

interface Props {
  proyectos: ProyectoAsesorado[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoProyectoAsesorado, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

const COLUMNAS: ColumnaTabla<ProyectoAsesorado>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'tituloProyecto',
    ordenable: true,
    celda: (proyecto) => <EnlaceProyectoAsesorado proyecto={proyecto} />,
  },
  {
    id: 'mapa',
    encabezado: 'Mapa de ruta',
    celda: (proyecto) => <MapaRutaProyectoCelda proyectoGradoId={proyecto.id} />,
  },
];

export default function MapasRutaAsesorTable({
  proyectos,
  cargando,
  hayFiltros,
  orden,
  onOrdenar,
  onLimpiarFiltros,
}: Props) {
  function ordenar(clave: string, direccion: DireccionOrden) {
    if (esOrdenCampo(clave)) onOrdenar(clave, direccion);
  }

  const vacio = hayFiltros ? (
    <EmptyState
      icono={SearchX}
      titulo="Sin resultados"
      descripcion="No hay proyectos que coincidan con tu búsqueda."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={Map}
      titulo="Aún no asesoras proyectos de grado"
      descripcion="Aquí verás el mapa de ruta de cada proyecto cuando el coordinador te asigne como asesor."
    />
  );

  return (
    <DataTable
      etiqueta="Mapas de ruta de los proyectos que asesoras"
      columnas={COLUMNAS}
      filas={proyectos}
      idDeFila={(proyecto) => proyecto.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      acciones={(proyecto) => <AccionesProyectoAsesorado proyecto={proyecto} />}
      tarjeta={(proyecto) => (
        <>
          <EnlaceProyectoAsesorado proyecto={proyecto} />
          <MapaRutaProyectoCelda proyectoGradoId={proyecto.id} />
        </>
      )}
    />
  );
}
