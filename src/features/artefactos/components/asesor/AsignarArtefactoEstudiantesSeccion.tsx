import { Controller, useWatch, type Control } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { useEstudiantesProyectoCatalogo } from '../../hooks/useEstudiantesProyectoCatalogo';
import type { AsignarArtefactoValues } from '../../utils/asignar-artefacto-schema';
import SelectorEstudiantesField from './SelectorEstudiantesField';

interface Props {
  control: Control<AsignarArtefactoValues>;
  catalogo: ReturnType<typeof useEstudiantesProyectoCatalogo>;
}

export default function AsignarArtefactoEstudiantesSeccion({ control, catalogo }: Props) {
  const proyectoGrado = useWatch({ control, name: 'proyectoGrado' });
  const sinProyecto = !proyectoGrado;
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
            <SelectorEstudiantesField
              opciones={catalogo.estudiantes}
              valor={field.value}
              onCambiar={field.onChange}
              onBlur={field.onBlur}
              refCampo={field.ref}
              error={fieldState.error?.message}
              deshabilitado={sinProyecto}
              textoVacio="Este proyecto no tiene estudiantes vigentes"
              placeholder={sinProyecto ? 'Elige primero un proyecto' : 'Busca por nombre o correo'}
            />
          )}
        />
      )}
    </FormSection>
  );
}
