import { Link, useLocation } from 'react-router';
import type { NavegacionDetalleTarea } from '../../models/NavegacionDetalleTarea';
import type { Tarea } from '../../models/Tarea';

const ENLACE =
  'block text-left font-medium text-on-surface hover:text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface Props {
  tarea: Tarea;
}

export default function EnlaceTarea({ tarea }: Props) {
  const { search } = useLocation();
  const navegacion: NavegacionDetalleTarea = { search };

  return (
    <Link
      to={`/mapas-ruta/tareas/${tarea.id}`}
      state={navegacion}
      aria-label={`Ver el detalle de ${tarea.descripcion}`}
      title={tarea.descripcion}
      className={ENLACE}
    >
      {tarea.descripcion}
    </Link>
  );
}
