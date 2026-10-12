import { Link, useLocation } from 'react-router';
import Badge from '../../../../shared/components/ui/Badge';
import type { OrigenNavegacion } from '../../../../shared/models/OrigenNavegacion';
import { varianteEstadoProyecto } from '../../../../shared/utils/estado-variante';

const ORIGEN: OrigenNavegacion = { etiqueta: 'Proyectos de grado', to: '/proyectos-grado' };
const TITULO = 'block truncate font-semibold text-on-surface';
const ENLACE =
  'font-medium text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface PropsTitulo {
  titulo: string;
}

export function TituloProyecto({ titulo }: PropsTitulo) {
  return (
    <span title={titulo} className={TITULO}>
      {titulo}
    </span>
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
