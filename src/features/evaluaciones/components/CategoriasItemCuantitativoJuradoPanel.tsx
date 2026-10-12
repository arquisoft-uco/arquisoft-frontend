import { useId, useState } from 'react';
import { SearchX, Tags } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import FilterBar from '../../../shared/components/ui/FilterBar';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useConsultarCategoriasItemCuantitativoJurado } from '../hooks/useConsultarCategoriasItemCuantitativoJurado';
import CategoriasItemCuantitativoJuradoTable from './CategoriasItemCuantitativoJuradoTable';

const RAIZ = 'flex flex-col gap-3';
const TITULO = 'text-base font-semibold text-on-surface';

export default function CategoriasItemCuantitativoJuradoPanel() {
  const idTitulo = useId();
  const [nombre, setNombre] = useState('');
  const { data, isLoading, isError, error, refetch } =
    useConsultarCategoriasItemCuantitativoJurado(nombre);

  const hayFiltro = nombre.trim().length > 0;

  function limpiar() {
    setNombre('');
  }

  return (
    <section aria-labelledby={idTitulo} className={RAIZ}>
      <div className="flex flex-col gap-1">
        <h2 id={idTitulo} className={TITULO}>
          Categorías
        </h2>
        <p className="text-sm text-on-surface-secondary">
          Categorías con las que se agrupan los ítems cuantitativos.
        </p>
      </div>

      <FilterBar
        busqueda={{
          valor: nombre,
          onCambiar: setNombre,
          etiqueta: 'Buscar categoría por nombre',
          placeholder: 'Buscar por nombre',
        }}
        aplicados={[]}
        onLimpiar={limpiar}
        totalResultados={data?.length}
      />

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando categorías" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar las categorías."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && data.length === 0 && !hayFiltro && (
        <EmptyState icono={Tags} titulo="No hay categorías registradas" />
      )}

      {data && data.length === 0 && hayFiltro && (
        <EmptyState
          icono={SearchX}
          titulo="No hay categorías que coincidan con la búsqueda"
          accion={
            <Button variante="secundario" onClick={limpiar}>
              Limpiar filtros
            </Button>
          }
        />
      )}

      {data && data.length > 0 && <CategoriasItemCuantitativoJuradoTable categorias={data} />}
    </section>
  );
}
