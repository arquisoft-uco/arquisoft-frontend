import { Link } from 'react-router';

const ENLACE =
  'group -m-2 flex flex-col gap-1 rounded-lg p-2 transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

interface Props {
  etiqueta: string;
  valor?: number;
  destino?: string;
}

export default function CifraInicio({ etiqueta, valor, destino }: Props) {
  const contenido = (
    <>
      <p className="text-3xl font-bold text-on-surface">
        {valor === undefined ? '—' : valor.toLocaleString('es-CO')}
      </p>
      <p className="text-sm text-on-surface-secondary group-hover:text-primary">{etiqueta}</p>
    </>
  );

  if (!destino) return <div className="flex flex-col gap-1">{contenido}</div>;

  return (
    <Link to={destino} className={ENLACE}>
      {contenido}
    </Link>
  );
}
