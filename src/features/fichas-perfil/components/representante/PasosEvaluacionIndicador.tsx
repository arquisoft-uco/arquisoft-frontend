import type { PasoAsistente } from '../../utils/evaluacion-asistente';

const PASOS: { id: PasoAsistente; etiqueta: string }[] = [
  { id: 'iniciar', etiqueta: 'Iniciar' },
  { id: 'observaciones', etiqueta: 'Observaciones' },
  { id: 'estado', etiqueta: 'Estado' },
];

const LISTA = 'flex flex-wrap items-center gap-x-4 gap-y-2';
const PASO = 'flex items-center gap-2 text-sm';
const NUMERO =
  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold';
const NUMERO_ACTUAL = 'bg-primary text-primary-foreground';
const NUMERO_OTRO = 'bg-muted text-on-surface-secondary';
const ETIQUETA_ACTUAL = 'font-semibold text-on-surface';
const ETIQUETA_OTRA = 'text-on-surface-secondary';

interface Props {
  paso: PasoAsistente;
}

export default function PasosEvaluacionIndicador({ paso }: Props) {
  const numero = PASOS.findIndex((p) => p.id === paso) + 1;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-on-surface-secondary">
        Paso {numero} de {PASOS.length}
      </p>
      <ol aria-label="Pasos de la evaluación" className={LISTA}>
        {PASOS.map((p, indice) => {
          const actual = p.id === paso;
          return (
            <li key={p.id} aria-current={actual ? 'step' : undefined} className={PASO}>
              <span className={[NUMERO, actual ? NUMERO_ACTUAL : NUMERO_OTRO].join(' ')}>
                {indice + 1}
              </span>
              <span className={actual ? ETIQUETA_ACTUAL : ETIQUETA_OTRA}>{p.etiqueta}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
