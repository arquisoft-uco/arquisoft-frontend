import { Controller, useWatch, type Control } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { useEstudiantesProyectoCatalogo } from '../../hooks/useEstudiantesProyectoCatalogo';
import type { AsignarArtefactoValues } from '../../utils/asignar-artefacto-schema';

interface Props {
  control: Control<AsignarArtefactoValues>;
  catalogo: ReturnType<typeof useEstudiantesProyectoCatalogo>;
}

export default function AsignarArtefactoEstudiantesSeccion({ control, catalogo }: Props) {
  const proyectoGrado = useWatch({ control, name: 'proyectoGrado' });
  const sinProyecto = !proyectoGrado;
  const opciones = catalogo.estudiantes.map((e) => ({
    id: e.estudianteId,
    etiqueta: e.nombre,
    descripcion: e.email,
  }));
  const cargando = !sinProyecto && catalogo.isLoading;
  const fallo = !sinProyecto && catalogo.isError;

  return (
    <FormSection titulo="Estudiantes">
      {cargando && <Skeleton variante="lineas" etiqueta="Cargando estudiantes…" />}
      {fallo && <AvisoNoDisponible recurso="estudiantes del proyecto" />}
      {!cargando && !fallo && (
        <Controller
          name="estudiantes"
          control={control}
          render={({ field, fieldState }) => (
            <Field etiqueta="Estudiantes" error={fieldState.error?.message}>
              {(campo) => (
                <Combobox
                  {...campo}
                  multiple
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={field.onChange}
                  opciones={opciones}
                  deshabilitado={sinProyecto}
                  etiquetaElegidos="Estudiantes elegidos"
                  textoVacio="Este proyecto no tiene estudiantes vigentes"
                  placeholder={
                    sinProyecto ? 'Elige primero un proyecto' : 'Busca por nombre o correo'
                  }
                />
              )}
            </Field>
          )}
        />
      )}
    </FormSection>
  );
}
