import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useModificarPlanRealForm } from '../../hooks/useModificarPlanRealForm';
import type { PlanReal } from '../../models/PlanReal';
import type { Tarea } from '../../models/Tarea';

const ID_FORMULARIO = 'modificar-plan-real';
const FORMULARIO = 'flex flex-col gap-6';

interface Props {
  tarea: Tarea;
  plan: PlanReal;
  onCerrar: () => void;
}

export default function ModificarPlanRealPanel({ tarea, plan, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, errores, irAlCampo } = useModificarPlanRealForm({
    tarea,
    plan,
    onCerrar,
  });
  const { register, watch, formState } = form;

  return (
    <SidePanel
      titulo="Editar plan real"
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
        aria-label="Edición del plan real"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Plan real">
          <Notice variante="info">
            Si la tarea vuelve a finalizarse, el sistema recalcula el plan real y reemplaza lo que
            edites aquí.
          </Notice>
          <Field etiqueta="Días reales" corto error={formState.errors.tiempoRealDias?.message}>
            {(campo) => (
              <input
                {...campo}
                {...register('tiempoRealDias')}
                type="text"
                inputMode="numeric"
                className="field-input"
              />
            )}
          </Field>
          <Field
            etiqueta="Descripción"
            opcional
            error={formState.errors.descripcionReal?.message}
            contador={{
              actual: (watch('descripcionReal') ?? '').length,
              max: LIMITES.PLAN_REAL_DESCRIPCION_MAX,
            }}
          >
            {(campo) => (
              <textarea
                {...campo}
                {...register('descripcionReal')}
                rows={4}
                maxLength={LIMITES.PLAN_REAL_DESCRIPCION_MAX}
                className="field-input"
              />
            )}
          </Field>
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
