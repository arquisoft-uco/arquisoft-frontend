import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useFichasPorEvaluar } from '../../hooks/useFichasPorEvaluar';
import CifraInicio from '../CifraInicio';
import { REJILLA_CIFRAS } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function CifrasFichasPanel() {
  const porEvaluar = useFichasPorEvaluar();
  const cargando = !porEvaluar.cargado && !porEvaluar.hayError;

  return (
    <SeccionInicio titulo="Cifras">
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando cifras…" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={REJILLA_CIFRAS}>
            <CifraInicio etiqueta="Fichas por evaluar" valor={porEvaluar.totalPorEvaluar} />
          </div>
          {porEvaluar.hayError && (
            <Notice
              variante="peligro"
              accion={{ etiqueta: 'Reintentar', onClick: () => void porEvaluar.reintentar() }}
            >
              No pudimos cargar las cifras.
            </Notice>
          )}
        </div>
      )}
    </SeccionInicio>
  );
}
