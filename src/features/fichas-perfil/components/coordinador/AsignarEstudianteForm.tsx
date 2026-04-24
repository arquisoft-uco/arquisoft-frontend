import { useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useAsignarEstudiante } from '../../hooks/useAsignarEstudiante';
import { consultarEstudiantesDisponibles } from '../../services/fichasPerfilMockService';
import { toast } from '../../../../shared/hooks/useToast';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';

const MAX_ESTUDIANTES = 3;

interface Props {
  idFichaPerfil: string;
  vinculados: EstudianteVinculado[];
}

export default function AsignarEstudianteForm({ idFichaPerfil, vinculados }: Props) {
  const [idEstudiante, setIdEstudiante] = useState('');

  const { data: disponibles = [] } = useQuery({
    queryKey: ['estudiantes-disponibles'],
    queryFn: consultarEstudiantesDisponibles,
  });

  const { mutate, isPending } = useAsignarEstudiante(idFichaPerfil);

  const idsVinculados = new Set(vinculados.map((v) => v.id));
  const opciones = disponibles.filter((e) => !idsVinculados.has(e.id));
  const limiteAlcanzado = vinculados.length >= MAX_ESTUDIANTES;

  if (limiteAlcanzado) {
    return (
      <p className="border-t border-border px-4 py-3 text-xs text-on-surface-secondary">
        Límite alcanzado: esta ficha ya tiene {MAX_ESTUDIANTES} estudiantes asignados.
      </p>
    );
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!idEstudiante) return;
    const estudiante = opciones.find((e) => e.id === idEstudiante)!;
    mutate(
      { idFichaPerfil, idEstudiante, nombre: estudiante.nombre, email: estudiante.email },
      {
        onSuccess: () => {
          toast.success('Estudiante asignado', 'El estudiante fue vinculado a la ficha correctamente.');
          setIdEstudiante('');
        },
        onError: (err) => {
          toast.error(
            'Error al asignar estudiante',
            err instanceof Error ? err.message : 'Verifica los datos e inténtalo nuevamente.',
          );
        },
      },
    );
  }

  if (opciones.length === 0) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border px-4 py-3"
      aria-label="Asignar estudiante"
    >
      <select
        value={idEstudiante}
        onChange={(e) => setIdEstudiante(e.target.value)}
        disabled={isPending}
        aria-label="Seleccionar estudiante a asignar"
        className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="">Seleccionar estudiante...</option>
        {opciones.map((est) => (
          <option key={est.id} value={est.id}>
            {est.nombre}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!idEstudiante || isPending}
        aria-label="Asignar estudiante seleccionado"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus size={13} aria-hidden />
        Asignar
      </button>
    </form>
  );
}
