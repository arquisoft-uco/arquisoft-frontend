import { Controller, type Control } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { NuevaFichaValues } from '../../hooks/useNuevaFichaForm';
import Combobox from '../Combobox';

interface Props {
  control: Control<NuevaFichaValues>;
  catalogo: { data?: Asesor[]; isLoading: boolean; isError: boolean };
}

export default function NuevaFichaAsesorSeccion({ control, catalogo }: Props) {
  const opciones = (catalogo.data ?? []).map((a) => ({
    id: a.id,
    etiqueta: a.nombre,
    descripcion: a.email,
  }));

  return (
    <FormSection titulo="Asesor">
      {catalogo.isLoading && <Skeleton variante="lineas" etiqueta="Cargando asesores…" />}
      {catalogo.isError && <AvisoNoDisponible recurso="asesores" />}
      {!catalogo.isLoading && !catalogo.isError && (
        <Controller
          name="idAsesorFicha"
          control={control}
          render={({ field, fieldState }) => (
            <Field etiqueta="Asesor" error={fieldState.error?.message}>
              {(campo) => (
                <Combobox
                  {...campo}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={field.onChange}
                  opciones={opciones}
                  etiquetaElegidos="Asesor elegido"
                  textoVacio="No hay asesores que coincidan."
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
