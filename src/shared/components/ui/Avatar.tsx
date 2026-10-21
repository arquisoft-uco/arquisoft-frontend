const BASE =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary-muted-foreground';

function iniciales(nombre: string): string {
  const letras = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => [...palabra][0]);
  return letras.length > 0 ? letras.join('').toUpperCase() : '?';
}

interface Props {
  nombre: string;
  className?: string;
}

export default function Avatar({ nombre, className }: Props) {
  return (
    <span aria-hidden="true" className={[BASE, className].filter(Boolean).join(' ')}>
      {iniciales(nombre)}
    </span>
  );
}
