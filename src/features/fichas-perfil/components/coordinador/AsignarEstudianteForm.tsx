import { useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsignarEstudiante } from '../../hooks/useAsignarEstudiante';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import { toast } from '../../../../shared/hooks/useToast';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import { LIMITES } from '../../../../shared/validation';

interface Props {
  idFichaPerfil: string;
  vinculados: EstudianteVinculado[];
}

export default function AsignarEstudianteForm({ idFichaPerfil, vinculados }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const { data: disponibles = [], isError: estudiantesNoDisponibles } = useQuery({
    queryKey: ['estudiantes-disponibles'],
    queryFn: fichasPerfilService.consultarEstudiantesDisponibles,
  });

  const { mutate, isPending } = useAsignarEstudiante(idFichaPerfil);

  const idsVinculados = new Set(vinculados.map((v) => v.id));
  const opciones = disponibles.filter((e) => !idsVinculados.has(e.id));
  const cuposDisponibles = LIMITES.ESTUDIANTES_MAX - vinculados.length;
  const limiteAlcanzado = cuposDisponibles <= 0;

  if (limiteAlcanzado) {
    return (
      <p className="border-t border-border px-4 py-3 text-xs text-on-surface-secondary">
        Límite alcanzado: esta ficha ya tiene {LIMITES.ESTUDIANTES_MAX} estudiantes asignados.
      </p>
    );
  }

  function toggleSeleccionado(id: string) {
    setSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < cuposDisponibles
          ? [...prev, id]
          : prev,
    );
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (seleccionados.length === 0) return;
    mutate(seleccionados, {
      onSuccess: () => {
        toast.success(
          'Estudiantes asignados',
          `${seleccionados.length} estudiante${seleccionados.length !== 1 ? 's fueron vinculados' : ' fue vinculado'} a la ficha correctamente.`,
        );
        setSeleccionados([]);
      },
      onError: (err) => {
        toast.error(
          'Error al asignar estudiantes',
          getApiErrorMessage(err, 'Verifica los datos e inténtalo nuevamente.'),
        );
      },
    });
  }

  if (estudiantesNoDisponibles) {
    return (
      <div className="border-t border-border px-4 py-3">
        <AvisoNoDisponible recurso="estudiantes" />
      </div>
    );
  }

  if (opciones.length === 0) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-t border-border px-4 py-3"
      aria-label="Asignar estudiantes"
    >
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-xs font-medium text-on-surface-secondary">
          Seleccionar hasta {cuposDisponibles} estudiante{cuposDisponibles !== 1 ? 's' : ''}
        </legend>
        {opciones.map((est) => {
          const checkboxId = `estudiante-disponible-${est.id}`;
          const marcado = seleccionados.includes(est.id);
          return (
            <label
              key={est.id}
              htmlFor={checkboxId}
              className="flex items-center gap-2 text-sm text-on-surface"
            >
              <input
                id={checkboxId}
                type="checkbox"
                checked={marcado}
                onChange={() => toggleSeleccionado(est.id)}
                disabled={isPending || (!marcado && seleccionados.length >= cuposDisponibles)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {est.nombre}
            </label>
          );
        })}
      </fieldset>
      <button
        type="submit"
        disabled={seleccionados.length === 0 || isPending}
        aria-label="Asignar estudiantes seleccionados"
        className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus size={13} aria-hidden />
        Asignar{seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}
      </button>
    </form>
  );
}
