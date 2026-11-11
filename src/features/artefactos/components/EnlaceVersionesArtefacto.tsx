import { Link, useLocation } from 'react-router';

const ENLACE =
  'font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

interface Props {
  artefactoId: string;
  nombreDocumento: string;
  vista: string;
}

export default function EnlaceVersionesArtefacto({ artefactoId, nombreDocumento, vista }: Props) {
  const { pathname, search } = useLocation();
  const estadoProyecto = new URLSearchParams(search).get('estadoProyecto');
  const parametros = new URLSearchParams({ vista, artefacto: artefactoId });
  if (estadoProyecto) parametros.set('estadoProyecto', estadoProyecto);

  return (
    <Link
      to={`${pathname}?${parametros.toString()}`}
      aria-label={`Ver versiones de ${nombreDocumento}`}
      className={ENLACE}
    >
      {nombreDocumento}
    </Link>
  );
}
