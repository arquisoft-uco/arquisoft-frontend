import { useState, type SyntheticEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCog } from 'lucide-react';
import { useCambiarAsesor } from '../../hooks/useCambiarAsesor';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import { toast } from '../../../../shared/hooks/useToast';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';

interface Props {
  idFichaPerfil: string;
  idAsesorActual: string;
}

export default function CambiarAsesorForm({ idFichaPerfil, idAsesorActual }: Props) {
  const [idAsesorSeleccionado, setIdAsesorSeleccionado] = useState('');
  const [confirming, setConfirming] = useState(false);

  const { data: asesores = [] } = useQuery({
    queryKey: ['asesores-disponibles'],
    queryFn: fichasPerfilService.consultarAsesoresDisponibles,
  });

  const { mutate, isPending } = useCambiarAsesor();

  const opciones = asesores.filter((a) => a.id !== idAsesorActual);

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!idAsesorSeleccionado) return;
    setConfirming(true);
  }

  function handleConfirmar() {
    mutate(
      { idFicha: idFichaPerfil, idAsesorFicha: idAsesorSeleccionado },
      {
        onSuccess: () => {
          toast.success('Asesor actualizado', 'El asesor de la ficha fue cambiado correctamente.');
          setIdAsesorSeleccionado('');
          setConfirming(false);
        },
        onError: (err) => {
          toast.error(
            'Error al cambiar asesor',
            err instanceof Error ? err.message : 'Inténtalo nuevamente.',
          );
          setConfirming(false);
        },
      },
    );
  }

  const asesorNuevo = asesores.find((a) => a.id === idAsesorSeleccionado);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
        aria-label="Cambiar asesor de ficha"
      >
        <UserCog size={15} className="shrink-0 text-on-surface-secondary" aria-hidden />
        <select
          value={idAsesorSeleccionado}
          onChange={(e) => setIdAsesorSeleccionado(e.target.value)}
          disabled={isPending || opciones.length === 0}
          aria-label="Seleccionar nuevo asesor"
          className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">
            {opciones.length === 0 ? 'Sin asesores disponibles' : '-- Seleccionar nuevo asesor --'}
          </option>
          {opciones.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre} ({a.email})
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!idAsesorSeleccionado || isPending}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

      {confirming && asesorNuevo && (
        <ConfirmDialog
          titulo="¿Cambiar asesor de la ficha?"
          descripcion={`El nuevo asesor será ${asesorNuevo.nombre} (${asesorNuevo.email}). Esta acción reemplazará al asesor actual.`}
          labelConfirmar="Sí, cambiar"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={handleConfirmar}
          onCancelar={() => setConfirming(false)}
        />
      )}
    </>
  );
}
