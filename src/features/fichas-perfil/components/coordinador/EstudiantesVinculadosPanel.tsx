import { Mail, User } from 'lucide-react';
import { useEstudiantesVinculados } from '../../hooks/useEstudiantesVinculados';

interface Props {
  idFichaPerfil: string;
}

export default function EstudiantesVinculadosPanel({ idFichaPerfil }: Props) {
  const { data, isLoading, isError } = useEstudiantesVinculados(idFichaPerfil);

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 py-3 px-4 text-sm text-on-surface-secondary"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
        >
          <span className="sr-only">Cargando estudiantes vinculados...</span>
        </div>
        Cargando estudiantes...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-3 px-4 text-sm text-red-600" role="alert">
        No se pudieron cargar los estudiantes vinculados.
      </p>
    );
  }

  const estudiantes = data ?? [];

  if (estudiantes.length === 0) {
    return (
      <p className="py-3 px-4 text-sm text-on-surface-secondary">
        No hay estudiantes vinculados a esta ficha.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border" aria-label="Estudiantes vinculados">
      {estudiantes.map((est) => (
        <li key={est.idVinculo} className="flex items-center gap-3 px-4 py-2">
          <User size={15} className="shrink-0 text-on-surface-secondary" aria-hidden />
          <span className="text-sm font-medium text-on-surface">{est.nombre}</span>
          <span className="flex items-center gap-1 ml-auto text-xs text-on-surface-secondary">
            <Mail size={13} aria-hidden />
            {est.email}
          </span>
        </li>
      ))}
    </ul>
  );
}
