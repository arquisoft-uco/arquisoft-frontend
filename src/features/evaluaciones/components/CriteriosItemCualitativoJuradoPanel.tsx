import { ListChecks } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useCriteriosItemCualitativoJurado } from '../hooks/useCriteriosItemCualitativoJurado';

interface Props {
  onCerrar: () => void;
}

export default function CriteriosItemCualitativoJuradoPanel({ onCerrar }: Props) {
  const {
    data: criterios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCriteriosItemCualitativoJurado();

  function contenido() {
    if (isLoading) {
      return <Skeleton variante="tarjetas" etiqueta="Cargando criterios…" />;
    }

    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los criterios"
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente más tarde.')}
          onReintentar={() => void refetch()}
        />
      );
    }

    if (criterios.length === 0) {
      return (
        <EmptyState
          icono={ListChecks}
          titulo="Aún no hay criterios registrados"
          descripcion="Cuando se registren, aparecerán aquí."
        />
      );
    }

    return (
      <ul aria-label="Criterios de los ítems" className="flex flex-col gap-3">
        {criterios.map((criterio) => (
          <li
            key={criterio.id}
            className="flex flex-col gap-0.5 rounded-xl border border-border p-3.5"
          >
            <span className="text-sm font-semibold break-words text-on-surface">
              {criterio.nombre}
            </span>
            <span className="text-sm break-words text-on-surface-secondary">
              {criterio.descripcion}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <SidePanel
      titulo="Criterios de los ítems"
      descripcion="Los criterios con los que se valoran los ítems cualitativos."
      onCerrar={onCerrar}
    >
      {contenido()}
    </SidePanel>
  );
}
