import type { Ref } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../../shared/validation';
import type { AsesorProyecto } from '../../models/AsesorProyecto';
import type { InformacionTareaValues } from '../../utils/informacion-tarea';
import ElegirAsesorTarea from './ElegirAsesorTarea';

interface Props {
  form: UseFormReturn<InformacionTareaValues>;
  asesor: string;
  elegirAsesor: (id: string) => void;
  opcionesAsesor: AsesorProyecto[];
  cargandoAsesores: boolean;
  errorAsesores: boolean;
  reintentarAsesores: () => void;
  descripcionErrorAsesores: string;
  grupoAsesor: Ref<HTMLDivElement>;
}

export default function CamposInformacionTarea({
  form,
  asesor,
  elegirAsesor,
  opcionesAsesor,
  cargandoAsesores,
  errorAsesores,
  reintentarAsesores,
  descripcionErrorAsesores,
  grupoAsesor,
}: Props) {
  const { register, watch, formState } = form;

  return (
    <FormSection titulo="Información de la tarea">
      <Field
        etiqueta="Descripción"
        error={formState.errors.descripcion?.message}
        contador={{
          actual: (watch('descripcion') ?? '').length,
          max: LIMITES.TAREA_DESCRIPCION_MAX,
        }}
      >
        {(campo) => (
          <textarea
            {...campo}
            {...register('descripcion')}
            rows={4}
            maxLength={LIMITES.TAREA_DESCRIPCION_MAX}
            className="field-input"
          />
        )}
      </Field>
      <ElegirAsesorTarea
        opciones={opcionesAsesor}
        elegido={asesor}
        onElegir={elegirAsesor}
        cargando={cargandoAsesores}
        hayError={errorAsesores}
        onReintentar={reintentarAsesores}
        descripcionError={descripcionErrorAsesores}
        error={formState.errors.asesor?.message}
        grupoRef={grupoAsesor}
      />
    </FormSection>
  );
}
