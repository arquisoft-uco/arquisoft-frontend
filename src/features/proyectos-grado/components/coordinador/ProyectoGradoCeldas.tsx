import { Link } from 'react-router';
import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoProyectoGrado } from '../../../../shared/utils/estado-variante';

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
  return <Badge variante={varianteEstadoProyectoGrado(estadoId)}>{nombre}</Badge>;
}

interface PropsEnlace {
  fichaPerfilId: string;
  titulo: string;
}

export function EnlaceFichaPerfil({ fichaPerfilId, titulo }: PropsEnlace) {
  return (
    <Link
      to={`/fichas-perfil/${fichaPerfilId}/evaluaciones`}
      aria-label={`Ver la ficha de perfil de ${titulo}`}
      className={ENLACE}
    >
      Ver ficha de perfil
    </Link>
  );
}
