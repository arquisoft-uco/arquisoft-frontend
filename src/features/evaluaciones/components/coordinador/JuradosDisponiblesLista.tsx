import { useState } from 'react';
import { SearchX, Users } from 'lucide-react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FilterBarBusqueda from '../../../../shared/components/ui/FilterBarBusqueda';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useJuradosVigentes } from '../../hooks/useJuradosVigentes';
import type { JuradoVigente } from '../../models/JuradoVigente';
import OpcionJurado from './OpcionJurado';

const RAIZ = 'flex flex-col gap-3';
const LISTA = 'flex flex-col gap-2';

interface Props {
  elegidosIds: ReadonlySet<string>;
  onAlternar: (jurado: JuradoVigente) => void;
}

export default function JuradosDisponiblesLista({ elegidosIds, onAlternar }: Props) {
  const [texto, setTexto] = useState('');
  const [pagina, setPagina] = useState(0);
  const [reinicios, setReinicios] = useState(0);
  const { data, isLoading, isError, error, isFetching, refetch, pageSize } = useJuradosVigentes(
    pagina,
    texto,
  );
  const jurados = data?.content ?? [];
  const hayTexto = texto.trim() !== '';

  function cambiarTexto(valor: string) {
    setTexto(valor);
    setPagina(0);
  }

  function limpiarBusqueda() {
    cambiarTexto('');
    setReinicios((actual) => actual + 1);
  }

  function renderContenido() {
    if (isLoading) return <Skeleton variante="lineas" etiqueta="Cargando jurados…" />;
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los jurados"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      );
    }
    if (jurados.length === 0 && hayTexto) {
      return (
        <EmptyState
          icono={SearchX}
          titulo="Sin resultados"
          descripcion="No hay jurados que coincidan con tu búsqueda."
          accion={
            <Button variante="secundario" onClick={limpiarBusqueda}>
              Limpiar búsqueda
            </Button>
          }
        />
      );
    }
    if (jurados.length === 0) {
      return (
        <EmptyState
          icono={Users}
          titulo="No hay jurados vigentes"
          descripcion="Podrás asignar jurados cuando haya jurados registrados."
        />
      );
    }
    return (
      <ul aria-label="Jurados disponibles" className={LISTA}>
        {jurados.map((jurado) => (
          <li key={jurado.id}>
            <OpcionJurado
              jurado={jurado}
              elegido={elegidosIds.has(jurado.id)}
              onAlternar={onAlternar}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={RAIZ}>
      <div>
        <FilterBarBusqueda
          key={reinicios}
          valor={texto}
          onCambiar={cambiarTexto}
          etiqueta="Buscar jurados"
          placeholder="Buscar por nombre"
        />
      </div>
      <div aria-busy={isFetching} className={RAIZ}>
        {renderContenido()}
        {!isError && (
          <PaginadorListado
            page={pagina}
            pageSize={pageSize}
            totalPages={data?.totalPages ?? 0}
            totalElements={data?.totalElements ?? 0}
            cantidadEnPagina={jurados.length}
            etiquetaPlural="jurados"
            onPageChange={setPagina}
          />
        )}
      </div>
    </div>
  );
}
