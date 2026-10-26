import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBar from '../../../../shared/components/ui/FilterBar';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRepositoriosArtefacto } from '../../hooks/useRepositoriosArtefacto';
import RepositoriosTable from './RepositoriosTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'repositorio' : 'repositorios'}`;
}

interface Props {
  onGenerar?: () => void;
}

export default function ConsultarRepositorios({ onGenerar }: Props) {
  const listado = useRepositoriosArtefacto();
  const { data, isLoading, isError, error, isFetching, refetch } = listado;
  const repositorios = data?.content ?? [];
  const hayFiltros = listado.texto.trim() !== '';

  return (
    <div className={RAIZ}>
      <FilterBar
        busqueda={{
          valor: listado.texto,
          onCambiar: listado.setTexto,
          etiqueta: 'Buscar repositorios',
          placeholder: 'Buscar por nombre, descripción o administrador',
        }}
        aplicados={[]}
        onLimpiar={listado.limpiarFiltros}
        totalResultados={data?.totalElements}
      />

      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.totalElements)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar los repositorios"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <RepositoriosTable
            repositorios={repositorios}
            cargando={isLoading}
            hayFiltros={hayFiltros}
            orden={{ clave: listado.ordenCampo, direccion: listado.ordenDireccion }}
            onOrdenar={listado.setOrden}
            onLimpiarFiltros={listado.limpiarFiltros}
            onGenerar={onGenerar}
          />
        )}
      </div>

      {!isError && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={repositorios.length}
          etiquetaPlural="repositorios"
          onPageChange={listado.goToPage}
        />
      )}
    </div>
  );
}
