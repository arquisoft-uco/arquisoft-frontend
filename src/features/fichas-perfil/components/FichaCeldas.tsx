import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoFicha } from '../../../shared/utils/estado-variante';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const TITULO =
  'block truncate text-left font-semibold text-on-surface hover:text-primary hover:underline hover:underline-offset-4';
const TITULO_PLANO = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';

interface PropsTitulo {
  titulo: string;
  onAbrir?: () => void;
}

export function TituloFicha({ titulo, onAbrir }: PropsTitulo) {
  if (!onAbrir) {
    return (
      <span title={titulo} className={TITULO_PLANO}>
        {titulo}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Abrir la ficha ${titulo}`}
      title={titulo}
      onClick={onAbrir}
      className={TITULO}
    >
      {titulo}
    </button>
  );
}

interface PropsAsesor {
  nombre: string;
  email: string;
}

export function AsesorDeFicha({ nombre, email }: PropsAsesor) {
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={nombre} />
      <div className={TEXTOS}>
        <span title={nombre} className={TITULO_PLANO}>
          {nombre}
        </span>
        <span title={email} className={SUBTEXTO}>
          {email}
        </span>
      </div>
    </div>
  );
}

interface PropsInsignia {
  estadoId: string;
  nombre: string;
}

export function InsigniaEstadoFicha({ estadoId, nombre }: PropsInsignia) {
  return <Badge variante={varianteEstadoFicha(estadoId)}>{nombre}</Badge>;
}

interface PropsFecha {
  iso: string;
}

export function FechaDeEstado({ iso }: PropsFecha) {
  const fecha = new Date(iso);
  if (!iso || Number.isNaN(fecha.getTime())) return <span>—</span>;

  return <time dateTime={iso}>{formatoFecha.format(fecha)}</time>;
}
