import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useResumenUsuarios } from '../../hooks/useResumenUsuarios';
import CifraInicio from '../CifraInicio';
import { REJILLA_CIFRAS } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function CifrasUsuariosPanel() {
  const { vigentes, bajas, cargando, hayError, reintentar } = useResumenUsuarios();

  return (
    <SeccionInicio titulo="Usuarios">
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando cifras…" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={REJILLA_CIFRAS}>
            <CifraInicio etiqueta="Usuarios vigentes" valor={vigentes} />
            <CifraInicio etiqueta="Dados de baja" valor={bajas} />
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
