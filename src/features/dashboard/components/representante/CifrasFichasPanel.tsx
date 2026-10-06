import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useFichasPorEvaluar } from '../../hooks/useFichasPorEvaluar';
import { useTotalFichas } from '../../hooks/useTotalFichas';
import CifraInicio from '../CifraInicio';
import { REJILLA_CIFRAS } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function CifrasFichasPanel() {
  const porEvaluar = useFichasPorEvaluar();
  const total = useTotalFichas();
  const cargando =
    (!porEvaluar.cargado && !porEvaluar.hayError) || (!total.cargado && !total.hayError);

  function reintentar() {
    if (porEvaluar.hayError) void porEvaluar.reintentar();
    if (total.hayError) void total.reintentar();
  }

  return (
    <SeccionInicio titulo="Cifras">
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando cifras…" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={REJILLA_CIFRAS}>
            <CifraInicio etiqueta="Fichas por evaluar" valor={porEvaluar.totalPorEvaluar} />
            <CifraInicio etiqueta="Fichas en total" valor={total.total} />
          </div>
          {(porEvaluar.hayError || total.hayError) && (
            <Notice variante="peligro" accion={{ etiqueta: 'Reintentar', onClick: reintentar }}>
              No pudimos cargar las cifras.
            </Notice>
          )}
        </div>
      )}
    </SeccionInicio>
  );
}
