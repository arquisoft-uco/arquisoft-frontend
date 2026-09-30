import { RefreshCw } from 'lucide-react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import FiltrosUsuariosPanel from './FiltrosUsuariosPanel';
import UsuariosTable from './UsuariosTable';

export default function ConsultarUsuarios() {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    page,
    pageSize,
    goToPage,
    rolesSeleccionados,
    toggleRol,
    estado,
    setEstado,
    vigente,
    setVigente,
    ordenCampo,
    ordenDireccion,
    setOrden,
  } = useUsuarios();

  const totalElements = data?.totalElements ?? 0;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="usuarios-titulo">
      <header className="section-header">
        <div>
          <h2 id="usuarios-titulo" className="text-lg font-semibold text-on-surface">
            Todos los usuarios
          </h2>
          {data && (
            <p className="mt-1 text-sm text-on-surface-secondary">
              {totalElements} usuario{totalElements !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="header-action inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-on-surface transition-colors hover:bg-nav-hover-bg disabled:cursor-not-allowed disabled:opacity-50 sm:py-2"
        >
          <RefreshCw size={16} aria-hidden className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </header>

      <FiltrosUsuariosPanel
        rolesSeleccionados={rolesSeleccionados}
        toggleRol={toggleRol}
        estado={estado}
        setEstado={setEstado}
        vigente={vigente}
        setVigente={setVigente}
        ordenCampo={ordenCampo}
        ordenDireccion={ordenDireccion}
        setOrden={setOrden}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-16" aria-live="polite" aria-busy="true">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
            role="status"
          >
            <span className="sr-only">Cargando usuarios...</span>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center" role="alert">
          <p className="text-sm text-on-surface-secondary">
            {getApiErrorMessage(error, 'No se pudieron cargar los usuarios. Intenta nuevamente.')}
          </p>
        </div>
      )}

      {data && (
        <UsuariosTable
          usuarios={data.content}
          totalElements={totalElements}
          totalPages={data.totalPages}
          page={page}
          pageSize={pageSize}
          onPageChange={goToPage}
        />
      )}
    </section>
  );
}
