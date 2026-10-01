import { useState, type SyntheticEvent } from 'react';
import { UserCog } from 'lucide-react';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCambiarAsesor } from '../../hooks/useCambiarAsesor';
import { useAsesoresFichaVigentes } from '../../../../shared/hooks/useAsesoresFichaVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import SelectorAsesorFicha from '../../../../shared/components/SelectorAsesorFicha';

interface Props {
  idFichaPerfil: string;
  idAsesorActual: string;
  onExito?: () => void;
}

export default function CambiarAsesorForm({ idFichaPerfil, idAsesorActual, onExito }: Props) {
  const [idAsesorSeleccionado, setIdAsesorSeleccionado] = useState('');
  const [confirming, setConfirming] = useState(false);

  const { data: asesores = [], isError: asesoresNoDisponibles } = useAsesoresFichaVigentes();

  const { mutate, isPending } = useCambiarAsesor();

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    if (!idAsesorSeleccionado) return;
    setConfirming(true);
  }

  function handleConfirmar() {
    if (!asesorNuevo) return;
    mutate(
      { idFicha: idFichaPerfil, idAsesorFicha: idAsesorSeleccionado, asesorNuevo },
      {
        onSuccess: () => {
          toast.success('Asesor actualizado', 'El asesor de la ficha fue cambiado correctamente.');
          setIdAsesorSeleccionado('');
          setConfirming(false);
          onExito?.();
        },
        onError: (err) => {
          toast.error(
            'Error al cambiar asesor',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          setConfirming(false);
        },
      },
    );
  }

  const asesorNuevo = asesores.find((a) => a.id === idAsesorSeleccionado);

  if (asesoresNoDisponibles) {
    return (
      <div className="border-t border-border px-4 py-3">
        <AvisoNoDisponible recurso="asesores" />
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
        aria-label="Cambiar asesor de ficha"
      >
        <UserCog size={15} className="shrink-0 text-on-surface-secondary" aria-hidden />
        <div className="flex-1">
          <SelectorAsesorFicha
            value={idAsesorSeleccionado}
            onChange={setIdAsesorSeleccionado}
            idsExcluidos={[idAsesorActual]}
            placeholder="-- Seleccionar nuevo asesor --"
            aria-label="Seleccionar nuevo asesor"
          />
        </div>
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
