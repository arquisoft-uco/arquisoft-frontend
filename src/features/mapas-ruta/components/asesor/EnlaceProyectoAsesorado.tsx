import { Link, useLocation } from 'react-router';
import { useMapaRutaProyectoAsesor } from '../../hooks/useMapaRutaProyectoAsesor';
import type { NavegacionDetalleTarea } from '../../models/NavegacionDetalleTarea';
import type { ProyectoAsesorado } from '../../models/ProyectoAsesorado';

const TITULO = 'font-medium text-on-surface';
const ENLACE =
  'block text-left font-medium text-on-surface hover:text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface Props {
  proyecto: ProyectoAsesorado;
}

export default function EnlaceProyectoAsesorado({ proyecto }: Props) {
  const { search } = useLocation();
  const { mapa } = useMapaRutaProyectoAsesor(proyecto.id);
  const navegacion: NavegacionDetalleTarea = { search };

  if (!mapa) return <span className={TITULO}>{proyecto.titulo}</span>;

  return (
    <Link
      to={`/mapas-ruta/proyectos/${proyecto.id}/tareas`}
      state={navegacion}
      aria-label={`Ver las tareas de ${proyecto.titulo}`}
      title={proyecto.titulo}
      className={ENLACE}
    >
      {proyecto.titulo}
    </Link>
  );
}
