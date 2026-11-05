import { useRef } from 'react';
import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useModificarInformacionTareaForm } from '../../hooks/useModificarInformacionTareaForm';
import type { Tarea } from '../../models/Tarea';
import ElegirAsesorTarea from './ElegirAsesorTarea';

const ID_FORMULARIO = 'modificar-informacion-tarea';
const FORMULARIO = 'flex flex-col gap-6';

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
}

export default function ModificarInformacionTareaPanel({ tarea, onCerrar }: Props) {
  const {
    form,
    enviar,
    enviando,
    cerrar,
    isDirty,
    errores,
    irAlCampo,
    asesor,
    elegirAsesor,
    opcionesAsesor,
    cargandoAsesores,
    errorAsesores,
    reintentarAsesores,
  } = useModificarInformacionTareaForm({ tarea, onCerrar });
  const { register, watch, formState } = form;
  const grupoAsesor = useRef<HTMLDivElement>(null);

  function irA(campo: string) {
    if (campo !== 'asesor') {
      irAlCampo(campo);
      return;
    }
    const grupo = grupoAsesor.current;
    const radio = grupo?.querySelector<HTMLInputElement>('input:checked, input');
    (radio ?? grupo)?.focus();
  }

  return (
    <SidePanel
      titulo="Editar tarea"
      descripcion={tarea.descripcion}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar cambios"
          accionEnviando="Guardando…"
          enviando={enviando}
          sucio={isDirty}
          sinCambios={!isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Edición de la tarea"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
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
            error={formState.errors.asesor?.message}
            grupoRef={grupoAsesor}
          />
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irA} />
      </form>
    </SidePanel>
  );
}
