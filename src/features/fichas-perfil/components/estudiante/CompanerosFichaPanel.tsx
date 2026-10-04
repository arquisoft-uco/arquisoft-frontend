import { Mail, User, Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCompanerosFichaPerfil } from '../../hooks/useCompanerosFichaPerfil';

interface Props {
  idFichaPerfil: string;
}

export default function CompanerosFichaPanel({ idFichaPerfil }: Props) {
  const { data, isLoading, isError, error, refetch } = useCompanerosFichaPerfil(idFichaPerfil);

  const companeros = data ?? [];

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center gap-1.5">
        <Users size={14} className="text-on-surface-secondary" aria-hidden />
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-secondary">
          Compañeros
        </p>
      </div>

      {isLoading && <Skeleton variante="lineas" etiqueta="Cargando compañeros…" />}

      {isError && (
        <ErrorState
          titulo={getApiErrorMessage(error, 'No se pudieron cargar los compañeros.')}
          onReintentar={refetch}
        />
      )}

      {!isLoading && !isError && companeros.length === 0 && (
        <EmptyState icono={Users} titulo="No tienes compañeros vinculados a esta ficha." />
      )}

      {!isLoading && !isError && companeros.length > 0 && (
        <ul className="space-y-1 pl-5" aria-label="Compañeros">
          {companeros.map((c) => (
            <li
              key={c.idVinculo}
              className="flex flex-col gap-0.5 text-xs text-on-surface-secondary sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="flex items-center gap-1.5 font-medium text-on-surface">
                <User size={13} className="shrink-0 text-on-surface-secondary" aria-hidden />
                {c.nombre}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={12} className="shrink-0" aria-hidden />
                <span className="min-w-0 break-words">{c.email}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
