import { useEvaluacionesPorEvaluar } from '../hooks/useEvaluacionesPorEvaluar';
import { contarEnFrase } from '../utils/frase-conteo';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';
import EvaluacionesPorEvaluarPanel from './jurado/EvaluacionesPorEvaluarPanel';

const RESUMEN: readonly Cifra[] = [
  { recurso: 'evaluaciones-jurado', etiqueta: 'Evaluaciones asignadas', destino: '/evaluaciones' },
  { recurso: 'entregables-jurado', etiqueta: 'Entregables asignados', destino: '/entregables' },
];

function fraseDeEvaluaciones(total?: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'No tienes evaluaciones por evaluar.';
  return `Tienes ${contarEnFrase(total, 'evaluación', 'evaluaciones')} por evaluar.`;
}

export default function JuradoView() {
  const { total } = useEvaluacionesPorEvaluar();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeEvaluaciones(total)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <EvaluacionesPorEvaluarPanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasPanel titulo="Resumen" cifras={RESUMEN} />
        </div>
      </div>
    </div>
  );
}
