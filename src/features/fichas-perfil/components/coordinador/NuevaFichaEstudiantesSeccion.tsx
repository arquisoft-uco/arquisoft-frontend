import { Controller, type Control } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { EstudianteVigente } from '../../../../shared/models/EstudianteVigente';
import { LIMITES } from '../../../../shared/validation';
import type { NuevaFichaValues } from '../../hooks/useNuevaFichaForm';
import Combobox from '../Combobox';

interface Props {
  control: Control<NuevaFichaValues>;
  catalogo: { data?: EstudianteVigente[]; isLoading: boolean; isError: boolean };
}

export default function NuevaFichaEstudiantesSeccion({ control, catalogo }: Props) {
  const opciones = (catalogo.data ?? []).map((e) => ({
    id: e.id,
    etiqueta: e.nombre,
    descripcion: e.email,
  }));

  return (
    <FormSection titulo="Estudiantes">
      {catalogo.isLoading && <Skeleton variante="lineas" etiqueta="Cargando estudiantes…" />}
      {catalogo.isError && <AvisoNoDisponible recurso="estudiantes" />}
      {!catalogo.isLoading && !catalogo.isError && (
        <Controller
          name="idEstudiantes"
          control={control}
          render={({ field, fieldState }) => (
            <Field etiqueta="Estudiantes" error={fieldState.error?.message}>
              {(campo) => (
                <Combobox
                  {...campo}
                  multiple
                  max={LIMITES.ESTUDIANTES_MAX}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={field.onChange}
                  opciones={opciones}
                  etiquetaElegidos="Estudiantes elegidos"
                  textoVacio="No hay estudiantes que coincidan."
                  placeholder="Busca por nombre o correo"
                />
              )}
            </Field>
          )}
        />
      )}
    </FormSection>
  );
}
