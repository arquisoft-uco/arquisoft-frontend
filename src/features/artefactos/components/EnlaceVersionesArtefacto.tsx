import { Link, useLocation } from 'react-router';

const ENLACE =
  'font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

interface Props {
  artefactoId: string;
  nombreDocumento: string;
  vista: string;
}

export default function EnlaceVersionesArtefacto({ artefactoId, nombreDocumento, vista }: Props) {
  const { pathname } = useLocation();

  return (
    <Link
      to={`${pathname}?vista=${vista}&artefacto=${artefactoId}`}
      aria-label={`Ver versiones de ${nombreDocumento}`}
      className={ENLACE}
    >
      {nombreDocumento}
    </Link>
  );
}
