import { Link, useLocation } from 'react-router';
import Badge from '../../../../shared/components/ui/Badge';
import type { OrigenNavegacion } from '../../../../shared/models/OrigenNavegacion';
import { varianteEstadoProyecto } from '../../../../shared/utils/estado-variante';
import type { ProyectoGrado } from '../../models/ProyectoGrado';
import type { NavegacionDetalleProyecto } from '../../models/ResumenProyectoGrado';

const ORIGEN: OrigenNavegacion = { etiqueta: 'Proyectos de grado', to: '/proyectos-grado' };
const TITULO =
  'block truncate text-left font-semibold text-on-surface hover:text-primary hover:underline hover:underline-offset-4';
const ENLACE =
  'font-medium text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface PropsTitulo {
  proyecto: ProyectoGrado;
}

export function TituloProyecto({ proyecto }: PropsTitulo) {
  const { search } = useLocation();
  const titulo = proyecto.tituloProyecto;
  const navegacion: NavegacionDetalleProyecto = {
    search,
    resumen: {
      id: proyecto.id,
      titulo,
      estadoId: proyecto.estado.id,
      estadoNombre: proyecto.estado.nombre,
    },
  };

  return (
    <Link
      to={`/proyectos-grado/${proyecto.id}/asesores`}
      state={navegacion}
      aria-label={`Ver los asesores de ${titulo}`}
      title={titulo}
      className={TITULO}
    >
      {titulo}
    </Link>
  );
}

interface PropsInsignia {
  estadoId: string;
  nombre: string;
}

export function InsigniaEstadoProyecto({ estadoId, nombre }: PropsInsignia) {
  return <Badge variante={varianteEstadoProyecto(estadoId)}>{nombre}</Badge>;
}

interface PropsEnlace {
  fichaPerfilId: string;
  titulo: string;
}

export function EnlaceFichaPerfil({ fichaPerfilId, titulo }: PropsEnlace) {
  const { search } = useLocation();
  return (
    <Link
      to={`/fichas-perfil/${fichaPerfilId}/evaluaciones`}
      state={{ search, resumen: { id: fichaPerfilId, titulo }, origen: ORIGEN }}
      aria-label={`Ver la ficha de perfil de ${titulo}`}
      className={ENLACE}
    >
      Ver ficha de perfil
    </Link>
  );
}
