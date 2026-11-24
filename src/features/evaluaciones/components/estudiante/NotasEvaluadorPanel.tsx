import { useId } from 'react';
import type { NotasEvaluador } from '../../models/NotasEvaluador';
import { formatearNota } from '../../utils/formato-nota';

const ROTULO = 'text-sm font-semibold text-on-surface';
const TERMINO = 'text-[13px] text-on-surface-secondary';
const VALOR = 'font-medium text-on-surface';

interface Props {
  notas: NotasEvaluador;
}

function Dato({ termino, valor }: { termino: string; valor: number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={TERMINO}>{termino}</dt>
      <dd className={VALOR}>
        {formatearNota(valor)}
        {valor === null && <span className="sr-only">Sin calcular</span>}
      </dd>
    </div>
  );
}

export default function NotasEvaluadorPanel({ notas }: Props) {
  const idRotulo = useId();
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <p id={idRotulo} className={ROTULO}>
        Notas del asesor
      </p>
      <dl aria-labelledby={idRotulo} className="grid gap-3 sm:grid-cols-3">
        <Dato termino="Resumen cualitativo" valor={notas.resumenCualitativo} />
        <Dato termino="Resumen cuantitativo" valor={notas.resumenCuantitativo} />
        <Dato termino="Nota acumulada" valor={notas.notaAcumulada} />
      </dl>
    </section>
  );
}
