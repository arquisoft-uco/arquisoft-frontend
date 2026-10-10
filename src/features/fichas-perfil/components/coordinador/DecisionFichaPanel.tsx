import { useId, useRef, useState } from 'react';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useEvaluacionesFichaCoordinador } from '../../hooks/useEvaluacionesFichaCoordinador';
import { resumirEvaluacionesParaDecision } from '../../utils/decision-ficha';
import { DISPOSICION } from '../disposicion';
import DecisionFichaDialogo, { type Decision } from './DecisionFichaDialogo';
import ResumenEvaluacionesDecision from './ResumenEvaluacionesDecision';

const APOYO = 'text-sm text-on-surface-secondary';
const ETIQUETA = 'text-[13px] font-medium text-on-surface-secondary';
const GRUPO =
  'flex flex-col gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-primary';

interface Props {
  fichaPerfilId: string;
}

export default function DecisionFichaPanel({ fichaPerfilId }: Props) {
  const base = useId();
  const idTitulo = `${base}-titulo`;
  const idGrupo = `${base}-grupo`;
  const idError = `${base}-error`;
  const grupo = useRef<HTMLDivElement>(null);
  const [elegida, setElegida] = useState<Decision | null>(null);
  const [confirmando, setConfirmando] = useState<Decision | null>(null);
  const [sinElegir, setSinElegir] = useState(false);
  const { data, isLoading, isError } = useEvaluacionesFichaCoordinador(fichaPerfilId);

  const anticipa = !isLoading && !isError && data !== undefined;
  const { hayFinalizada, hayAprobatoria } = resumirEvaluacionesParaDecision(data ?? []);
  const sinFinalizada = anticipa && !hayFinalizada;
  const sinAprobatoria = anticipa && hayFinalizada && !hayAprobatoria;

  const aprobarDeshabilitado = isLoading || sinFinalizada || sinAprobatoria;
  const noAprobarDeshabilitado = isLoading || sinFinalizada;
  const elegidaEfectiva =
    elegida === 'aprobar' && !aprobarDeshabilitado
      ? 'aprobar'
      : elegida === 'no-aprobar' && !noAprobarDeshabilitado
        ? 'no-aprobar'
        : null;

  function elegir(valor: string) {
    setElegida(valor as Decision);
    setSinElegir(false);
  }

  function registrar() {
    if (!elegidaEfectiva) {
      setSinElegir(true);
      grupo.current?.focus();
      return;
    }
    setConfirmando(elegidaEfectiva);
  }

  return (
    <section aria-labelledby={idTitulo} className={DISPOSICION.tarjetaLateral}>
      <h2 id={idTitulo} className={DISPOSICION.tituloLateral}>
        Decisión sobre la ficha
      </h2>
      <p className={APOYO}>
        Revisa las evaluaciones y decide si la ficha avanza. No se puede deshacer.
      </p>

      {isLoading ? (
        <Skeleton variante="lineas" etiqueta="Cargando evaluaciones…" />
      ) : (
        <ResumenEvaluacionesDecision evaluaciones={data ?? []} />
      )}

      <span id={idGrupo} className={ETIQUETA}>
        Tu decisión
      </span>
      <div
        ref={grupo}
        role="radiogroup"
        aria-labelledby={idGrupo}
        aria-describedby={sinElegir ? idError : undefined}
        tabIndex={-1}
        className={GRUPO}
      >
        <OpcionRadio
          nombre={base}
          valor="aprobar"
          titulo="Aprobar la ficha"
          descripcion="Pasa a aprobada y se crea el proyecto de grado del equipo."
          elegida={elegidaEfectiva === 'aprobar'}
          deshabilitada={aprobarDeshabilitado}
          onElegir={elegir}
        />
        <OpcionRadio
          nombre={base}
          valor="no-aprobar"
          titulo="No aprobar la ficha"
          descripcion="Queda como no aprobada y no vuelve a evaluación."
          elegida={elegidaEfectiva === 'no-aprobar'}
          deshabilitada={noAprobarDeshabilitado}
          onElegir={elegir}
        />
      </div>

      {sinElegir && (
        <p id={idError} role="alert" className="field-error">
          Elige una decisión para continuar.
        </p>
      )}
      {sinFinalizada && (
        <Notice variante="info">
          Podrás decidir cuando al menos una evaluación esté finalizada.
        </Notice>
      )}
      {sinAprobatoria && (
        <Notice variante="info">
          Para aprobar la ficha, al menos una evaluación debe estar aprobada.
        </Notice>
      )}
      {isError && (
        <Notice variante="advertencia">
          No pudimos revisar las evaluaciones; el servidor validará tu decisión.
        </Notice>
      )}

      <Button disabled={aprobarDeshabilitado && noAprobarDeshabilitado} onClick={registrar}>
        Registrar decisión
      </Button>

      {confirmando && (
        <DecisionFichaDialogo
          fichaPerfilId={fichaPerfilId}
          decision={confirmando}
          onCerrar={() => setConfirmando(null)}
        />
      )}
    </section>
  );
}
