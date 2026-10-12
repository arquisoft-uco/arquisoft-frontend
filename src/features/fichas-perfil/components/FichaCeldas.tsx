import { Link, useLocation } from 'react-router';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import { varianteEstadoFicha } from '../../../shared/utils/estado-variante';
import type { NavegacionDetalleFicha, ResumenFicha } from '../models/ResumenFicha';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const TITULO =
  'block truncate text-left font-semibold text-on-surface hover:text-primary hover:underline hover:underline-offset-4';
const TITULO_PLANO = 'block truncate font-semibold text-on-surface';
const INSIGNIAS_TARJETA = 'flex flex-wrap items-center gap-1.5';
const DATO_TARJETA = 'text-[13px] text-on-surface-secondary';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';

interface PropsTitulo {
  titulo: string;
  abrir?: ResumenFicha;
  pestana?: string;
}

export function TituloFicha({ titulo, abrir, pestana = 'items' }: PropsTitulo) {
  const { search } = useLocation();

  if (!abrir) {
    return (
      <span title={titulo} className={TITULO_PLANO}>
        {titulo}
      </span>
    );
  }

  const navegacion: NavegacionDetalleFicha = { resumen: abrir, search };

  return (
    <Link
      to={`/fichas-perfil/${abrir.id}/${pestana}`}
      state={navegacion}
      aria-label={`Abrir la ficha ${titulo}`}
      title={titulo}
      className={TITULO}
    >
      {titulo}
    </Link>
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

interface PropsEstadoYFechaTarjeta {
  estadoId: string;
  nombre: string;
  iso: string;
}

export function EstadoYFechaTarjeta({ estadoId, nombre, iso }: PropsEstadoYFechaTarjeta) {
  return (
    <>
      <div className={INSIGNIAS_TARJETA}>
        <InsigniaEstadoFicha estadoId={estadoId} nombre={nombre} />
      </div>
      <p className={DATO_TARJETA}>
        <FechaDeEstado iso={iso} />
      </p>
    </>
  );
}
