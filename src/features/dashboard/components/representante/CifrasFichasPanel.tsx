import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useConteos } from '../../hooks/useConteos';
import { useFichasPorEvaluar } from '../../hooks/useFichasPorEvaluar';
import CifraInicio from '../CifraInicio';
import { REJILLA_CIFRAS } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

const RECURSOS = ['fichas-representante'] as const;

export default function CifrasFichasPanel() {
  const porEvaluar = useFichasPorEvaluar();
  const conteos = useConteos(RECURSOS);
  const cargando = (!porEvaluar.cargado && !porEvaluar.hayError) || conteos.cargando;
  const hayError = porEvaluar.hayError || conteos.hayError;

  function reintentar() {
    void porEvaluar.reintentar();
    conteos.reintentar();
  }

  return (
    <SeccionInicio titulo="Cifras">
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando cifras…" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={REJILLA_CIFRAS}>
            <CifraInicio
              etiqueta="Fichas por evaluar"
              valor={porEvaluar.totalPorEvaluar}
              destino="/fichas-perfil"
            />
            <CifraInicio
              etiqueta="Fichas en las que participo"
              valor={conteos.valores[0]}
              destino="/fichas-perfil?vista=participo"
            />
          </div>
          {hayError && (
            <Notice variante="peligro" accion={{ etiqueta: 'Reintentar', onClick: reintentar }}>
              No pudimos cargar las cifras.
            </Notice>
          )}
        </div>
      )}
    </SeccionInicio>
  );
}
