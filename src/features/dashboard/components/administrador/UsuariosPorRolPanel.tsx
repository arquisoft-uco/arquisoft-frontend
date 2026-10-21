import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { ETIQUETAS_ROL } from '../../../../shared/models/rol';
import { useUsuariosPorRol } from '../../hooks/useUsuariosPorRol';
import { LISTA } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function UsuariosPorRolPanel() {
  const { filas, cargando, hayError, reintentar } = useUsuariosPorRol();

  return (
    <SeccionInicio titulo="Usuarios por rol">
      {cargando ? (
        <Skeleton variante="lineas" etiqueta="Cargando usuarios por rol…" />
      ) : (
        <div className="flex flex-col gap-4">
          <ul className={LISTA}>
            {filas.map(({ rol, total }) => (
              <li key={rol} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-on-surface">{ETIQUETAS_ROL[rol]}</span>
                <span className="font-semibold text-on-surface">
                  {total === undefined ? '—' : total.toLocaleString('es-CO')}
                </span>
              </li>
            ))}
          </ul>
          {hayError && (
            <Notice variante="peligro" accion={{ etiqueta: 'Reintentar', onClick: reintentar }}>
              No pudimos cargar algunos conteos.
            </Notice>
          )}
        </div>
      )}
    </SeccionInicio>
  );
}
