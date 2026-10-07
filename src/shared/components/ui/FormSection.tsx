import { useId, type ReactNode } from 'react';

const RAIZ = 'flex min-w-0 flex-col gap-4';
const CABECERA = 'border-b border-border pb-2';
const TITULO = 'text-base font-semibold text-on-surface';
const OPCIONAL = 'font-normal text-on-surface-secondary';
const DESCRIPCION = 'text-sm text-on-surface-secondary';
const REJILLA = 'grid gap-4 sm:grid-cols-2';

interface Props {
  titulo: string;
  descripcion?: string;
  opcional?: boolean;
  children: ReactNode;
}

export default function FormSection({ titulo, descripcion, opcional, children }: Props) {
  const idTitulo = useId();

  return (
    <fieldset aria-labelledby={idTitulo} className={RAIZ}>
      <div className={CABECERA}>
        <h2 id={idTitulo} className={TITULO}>
          {titulo}
          {opcional && <span className={OPCIONAL}> (opcional)</span>}
        </h2>
        {descripcion && <p className={DESCRIPCION}>{descripcion}</p>}
      </div>
      {children}
    </fieldset>
  );
}

export function RejillaDeCampos({ children }: { children: ReactNode }) {
  return <div className={REJILLA}>{children}</div>;
}
