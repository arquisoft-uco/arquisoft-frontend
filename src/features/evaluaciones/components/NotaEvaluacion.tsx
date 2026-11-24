import Badge from '../../../shared/components/ui/Badge';
import { varianteResultadoEvaluacion } from '../../../shared/utils/estado-variante';
import type { ResultadoEvaluacion } from '../models/ResultadoEvaluacion';
import { formatearNota } from '../utils/formato-nota';

const TITULO = 'font-medium text-on-surface';
const DESGLOSE = 'text-[13px] text-on-surface-secondary';

interface Props {
  valor: number | null;
  desglose?: string;
}

export default function NotaEvaluacion({ valor, desglose }: Props) {
  return (
    <div className="flex flex-col">
      <span className={TITULO}>
        {formatearNota(valor)}
        {valor === null && <span className="sr-only">Sin calcular</span>}
      </span>
      {desglose && <span className={DESGLOSE}>{desglose}</span>}
    </div>
  );
}

export function InsigniaResultado({ resultado }: { resultado: ResultadoEvaluacion | null }) {
  if (resultado === null) {
    return (
      <span className={TITULO}>
        —<span className="sr-only">Sin calcular</span>
      </span>
    );
  }
  return <Badge variante={varianteResultadoEvaluacion(resultado.id)}>{resultado.nombre}</Badge>;
}
