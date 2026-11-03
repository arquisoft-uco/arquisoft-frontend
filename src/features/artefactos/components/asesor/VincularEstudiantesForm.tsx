import { Controller } from 'react-hook-form';
import { UserPlus } from 'lucide-react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useVincularEstudiantesForm } from '../../hooks/useVincularEstudiantesForm';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import SelectorEstudiantesField from './SelectorEstudiantesField';

const TEXTO_APOYO = 'text-sm text-on-surface-secondary';
const SIN_VINCULABLES = 'Todos los estudiantes vigentes del proyecto ya están vinculados.';

interface Props {
  artefacto: ArtefactoAsesor;
  onSalir: () => void;
}

export default function VincularEstudiantesForm({ artefacto, onSalir }: Props) {
  const { form, enviar, enviando, vinculables } = useVincularEstudiantesForm({
    artefacto,
    onSalir,
  });
  const seleccionados = form.watch('estudiantes').length;

  if (vinculables.isLoading) {
    return <Skeleton variante="lineas" etiqueta="Cargando estudiantes…" />;
  }
  if (vinculables.isError) return <AvisoNoDisponible recurso="estudiantes del proyecto" />;
  if (vinculables.estudiantes.length === 0) return <p className={TEXTO_APOYO}>{SIN_VINCULABLES}</p>;

  return (
    <form
      aria-label="Vincular estudiantes"
      noValidate
      aria-busy={enviando}
      onSubmit={enviar}
      className="flex flex-col gap-3"
    >
      <Controller
        name="estudiantes"
        control={form.control}
        render={({ field, fieldState }) => (
          <SelectorEstudiantesField
            opciones={vinculables.estudiantes}
            valor={field.value}
            onCambiar={field.onChange}
            onBlur={field.onBlur}
            refCampo={field.ref}
            error={fieldState.error?.message}
            textoVacio="No hay estudiantes que coincidan."
            placeholder="Busca por nombre o correo"
          />
        )}
      />
      <Button
        type="submit"
        icono={UserPlus}
        disabled={seleccionados === 0}
        cargando={enviando}
        aria-label="Vincular estudiantes seleccionados"
        className="self-start"
      >
        Vincular{seleccionados > 0 ? ` (${seleccionados})` : ''}
      </Button>
    </form>
  );
}
