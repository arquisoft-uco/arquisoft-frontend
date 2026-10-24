import { useId } from 'react';
import type { ReactNode } from 'react';
import { TARJETA } from './disposicion';

interface Props {
  titulo: string;
  accion?: ReactNode;
  children: ReactNode;
}

export default function SeccionInicio({ titulo, accion, children }: Props) {
  const idTitulo = useId();

  return (
    <section aria-labelledby={idTitulo} className={TARJETA}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id={idTitulo} className="text-base font-semibold text-on-surface">
          {titulo}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  );
}
