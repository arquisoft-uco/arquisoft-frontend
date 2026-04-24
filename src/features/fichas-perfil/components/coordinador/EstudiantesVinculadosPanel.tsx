import { Mail, User, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useEstudiantesVinculados } from '../../hooks/useEstudiantesVinculados';
import { useRemoverEstudiante } from '../../hooks/useRemoverEstudiante';
import { toast } from '../../../../shared/hooks/useToast';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import AsignarEstudianteForm from './AsignarEstudianteForm';

interface Props {
  idFichaPerfil: string;
}

export default function EstudiantesVinculadosPanel({ idFichaPerfil }: Props) {
  const { data, isLoading, isError } = useEstudiantesVinculados(idFichaPerfil);
  const { mutate: remover, isPending: removiendo } = useRemoverEstudiante(idFichaPerfil);
  const [pendienteRemover, setPendienteRemover] = useState<{ idVinculo: string; nombre: string } | null>(null);

  function handleConfirmarRemover() {
    if (!pendienteRemover) return;
    const { idVinculo, nombre } = pendienteRemover;
    remover(idVinculo, {
      onSuccess: () => {
        toast.success('Estudiante removido', `${nombre} fue removido de la ficha correctamente.`);
        setPendienteRemover(null);
      },
      onError: (err) => {
        toast.error(
          'Error al remover estudiante',
          err instanceof Error ? err.message : 'Inténtalo nuevamente.',
        );
        setPendienteRemover(null);
      },
    });
  }

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
      <div>
        <p className="py-3 px-4 text-sm text-on-surface-secondary">
          No hay estudiantes vinculados a esta ficha.
        </p>
        <AsignarEstudianteForm idFichaPerfil={idFichaPerfil} vinculados={[]} />
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border" aria-label="Estudiantes vinculados">
        {estudiantes.map((est) => (
          <li key={est.idVinculo} className="flex items-center gap-3 px-4 py-2">
            <User size={15} className="shrink-0 text-on-surface-secondary" aria-hidden />
            <span className="text-sm font-medium text-on-surface">{est.nombre}</span>
            <span className="flex items-center gap-1 ml-auto text-xs text-on-surface-secondary">
              <Mail size={13} aria-hidden />
              {est.email}
            </span>
            <button
              type="button"
              onClick={() => setPendienteRemover({ idVinculo: est.idVinculo, nombre: est.nombre })}
              disabled={removiendo}
              aria-label={`Remover a ${est.nombre} de la ficha`}
              className="ml-2 rounded-md p-1 text-on-surface-secondary transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <AsignarEstudianteForm idFichaPerfil={idFichaPerfil} vinculados={estudiantes} />

      {pendienteRemover && (
        <ConfirmDialog
          titulo="¿Remover estudiante?"
          descripcion={`${pendienteRemover.nombre} será removido de esta ficha de perfil.`}
          labelConfirmar="Remover"
          variante="peligro"
          cargando={removiendo}
          onConfirmar={handleConfirmarRemover}
          onCancelar={() => setPendienteRemover(null)}
        />
      )}
    </div>
  );
}
