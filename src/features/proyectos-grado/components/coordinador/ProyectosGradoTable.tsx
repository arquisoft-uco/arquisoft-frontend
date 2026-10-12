import { GraduationCap, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import DataTable from '../../../../shared/components/ui/DataTable';
import type {
  ColumnaTabla,
  DireccionOrden,
  OrdenTabla,
} from '../../../../shared/components/ui/DataTable';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import type { OrdenCampoProyectoGrado } from '../../models/OrdenCampoProyectoGrado';
import type { ProyectoGrado } from '../../models/ProyectoGrado';
import { EnlaceFichaPerfil, InsigniaEstadoProyecto, TituloProyecto } from './ProyectoGradoCeldas';

const TARJETA_ESTADO = 'flex flex-wrap items-center gap-1.5';

function esOrdenCampo(clave: string): clave is OrdenCampoProyectoGrado {
  return clave === 'tituloProyecto';
}

interface Props {
  proyectos: ProyectoGrado[];
  cargando: boolean;
  hayFiltros: boolean;
  orden: OrdenTabla;
  onOrdenar: (campo: OrdenCampoProyectoGrado, direccion: DireccionOrden) => void;
  onLimpiarFiltros: () => void;
}

const COLUMNAS: ColumnaTabla<ProyectoGrado>[] = [
  {
    id: 'proyecto',
    encabezado: 'Proyecto',
    clave: 'tituloProyecto',
    ordenable: true,
    celda: (proyecto) => <TituloProyecto titulo={proyecto.tituloProyecto} />,
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    celda: (proyecto) => (
      <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
    ),
  },
  {
    id: 'ficha',
    encabezado: 'Ficha de perfil',
    celda: (proyecto) => (
      <EnlaceFichaPerfil fichaPerfilId={proyecto.fichaPerfil} titulo={proyecto.tituloProyecto} />
    ),
  },
];

export default function ProyectosGradoTable({
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
      descripcion="No hay proyectos que coincidan con tu búsqueda o tus filtros."
      accion={
        <Button variante="secundario" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      }
    />
  ) : (
    <EmptyState
      icono={GraduationCap}
      titulo="Aún no tienes proyectos de grado"
      descripcion="Aparecerán aquí cuando se apruebe una ficha de perfil."
    />
  );

  return (
    <DataTable
      etiqueta="Proyectos de grado"
      columnas={COLUMNAS}
      filas={proyectos}
      idDeFila={(proyecto) => proyecto.id}
      orden={orden}
      onOrdenar={ordenar}
      cargando={cargando}
      vacio={vacio}
      tarjeta={(proyecto) => (
        <>
          <TituloProyecto titulo={proyecto.tituloProyecto} />
          <div className={TARJETA_ESTADO}>
            <InsigniaEstadoProyecto estadoId={proyecto.estado.id} nombre={proyecto.estado.nombre} />
          </div>
          <EnlaceFichaPerfil
            fichaPerfilId={proyecto.fichaPerfil}
            titulo={proyecto.tituloProyecto}
          />
        </>
      )}
    />
  );
}
