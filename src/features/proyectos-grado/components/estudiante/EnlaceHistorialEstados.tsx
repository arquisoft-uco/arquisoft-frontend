import { Link, useLocation } from 'react-router';
import type { ProyectoGrado } from '../../models/ProyectoGrado';
import type { NavegacionDetalleProyecto } from '../../models/ResumenProyectoGrado';

const ENLACE =
  'font-medium text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface Props {
  proyecto: ProyectoGrado;
}

export default function EnlaceHistorialEstados({ proyecto }: Props) {
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
      to={`/proyectos-grado/${proyecto.id}/estados`}
      state={navegacion}
      aria-label={`Ver el historial de estados de ${titulo}`}
      className={ENLACE}
    >
      Ver historial de estados
    </Link>
  );
}
