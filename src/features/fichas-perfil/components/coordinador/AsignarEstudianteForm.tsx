import { useState, type SyntheticEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAsignarEstudiante } from '../../hooks/useAsignarEstudiante';
import { useEstudiantesVigentes } from '../../../../shared/hooks/useEstudiantesVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import Field from '../../../../shared/components/ui/Field';
import { LIMITES } from '../../../../shared/validation';
import Combobox from '../Combobox';

const TEXTO_APOYO = 'text-sm text-on-surface-secondary';

interface Props {
  idFichaPerfil: string;
  vinculados: EstudianteVinculado[];
}

export default function AsignarEstudianteForm({ idFichaPerfil, vinculados }: Props) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const {
    data: disponibles = [],
    isLoading: estudiantesCargando,
    isError: estudiantesNoDisponibles,
  } = useEstudiantesVigentes();

  const { mutate, isPending } = useAsignarEstudiante(idFichaPerfil);

  const idsVinculados = new Set(vinculados.map((v) => v.id));
  const opciones = disponibles.filter((e) => !idsVinculados.has(e.id));
  const opcionesCombobox = opciones.map((e) => ({
    id: e.id,
    etiqueta: e.nombre,
    descripcion: e.email,
  }));
  const cuposDisponibles = LIMITES.ESTUDIANTES_MAX - vinculados.length;
  const limiteAlcanzado = cuposDisponibles <= 0;

  if (estudiantesCargando) {
    return (
      <p role="status" aria-live="polite" aria-busy="true" className={TEXTO_APOYO}>
        <span className="sr-only">Cargando estudiantes disponibles…</span>
        Cargando estudiantes...
      </p>
    );
  }

  if (limiteAlcanzado) {
    return (
      <p className={TEXTO_APOYO}>
        Límite alcanzado: esta ficha ya tiene {LIMITES.ESTUDIANTES_MAX} estudiantes asignados.
      </p>
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
    return <AvisoNoDisponible recurso="estudiantes" />;
  }

  if (opciones.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" aria-label="Asignar estudiantes">
      <Field etiqueta="Agregar estudiantes">
        {(control) => (
          <Combobox
            {...control}
            multiple
            max={cuposDisponibles}
            valor={seleccionados}
            onCambiar={setSeleccionados}
            deshabilitado={isPending}
            opciones={opcionesCombobox}
            etiquetaElegidos="Estudiantes por asignar"
            textoVacio="No hay estudiantes que coincidan."
            placeholder="Busca por nombre o correo"
          />
        )}
      </Field>
      <Button
        type="submit"
        icono={UserPlus}
        disabled={seleccionados.length === 0}
        cargando={isPending}
        aria-label="Asignar estudiantes seleccionados"
        className="self-start"
      >
        Asignar{seleccionados.length > 0 ? ` (${seleccionados.length})` : ''}
      </Button>
    </form>
  );
}
