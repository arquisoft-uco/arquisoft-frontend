import { Link, useLocation } from 'react-router';
import type { NavegacionVersionesRepositorio } from '../../models/NavegacionVersionesRepositorio';
import type { RepositorioArtefacto } from '../../models/RepositorioArtefacto';

const ENLACE =
  'block truncate text-left font-medium text-on-surface hover:text-primary hover:underline hover:underline-offset-4 focus-visible:underline';

interface Props {
  repositorio: RepositorioArtefacto;
  clase?: string;
}

export default function EnlaceRepositorio({ repositorio, clase }: Props) {
  const { search } = useLocation();
  const nombre = repositorio.nombreRepositorio;
  const navegacion: NavegacionVersionesRepositorio = {
    search,
    repositorio: { id: repositorio.id, nombre },
  };

  return (
    <Link
      to={`/repositorio-artefactos/${repositorio.id}/versiones`}
      state={navegacion}
      aria-label={`Ver las versiones de ${nombre}`}
      title={nombre}
      className={clase ?? ENLACE}
    >
      {nombre}
    </Link>
  );
}
