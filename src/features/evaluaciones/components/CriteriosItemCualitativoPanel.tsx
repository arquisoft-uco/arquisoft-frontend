import { ListChecks } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import SidePanel from '../../../shared/components/ui/SidePanel';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

interface CriterioListado {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Props {
  criterios: readonly CriterioListado[];
  cargando: boolean;
  error: unknown;
  descripcion: string;
  onReintentar: () => void;
  onCerrar: () => void;
}

export default function CriteriosItemCualitativoPanel({
  criterios,
  cargando,
  error,
  descripcion,
  onReintentar,
  onCerrar,
}: Props) {
  function contenido() {
    if (cargando) {
      return <Skeleton variante="tarjetas" etiqueta="Cargando criterios…" />;
    }

    if (error) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los criterios"
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente más tarde.')}
          onReintentar={onReintentar}
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
    <SidePanel titulo="Criterios de los ítems" descripcion={descripcion} onCerrar={onCerrar}>
      {contenido()}
    </SidePanel>
  );
}
