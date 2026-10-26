import ErrorState from '../../../../shared/components/ui/ErrorState';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useVersionesRepositorioArtefacto } from '../../hooks/useVersionesRepositorioArtefacto';
import VersionesRepositorioTable from './VersionesRepositorioTable';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'versión' : 'versiones'}`;
}

interface Props {
  repositorioId: string;
}

export default function ConsultarVersionesRepositorio({ repositorioId }: Props) {
  const { data, isLoading, isError, error, isFetching, refetch } =
    useVersionesRepositorioArtefacto(repositorioId);

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {textoResumen(data?.length)}
      </p>

      <div aria-busy={isFetching}>
        {isError ? (
          <ErrorState
            titulo="No se pudieron cargar las versiones"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : (
          <VersionesRepositorioTable versiones={data ?? []} cargando={isLoading} />
        )}
      </div>
    </div>
  );
}
