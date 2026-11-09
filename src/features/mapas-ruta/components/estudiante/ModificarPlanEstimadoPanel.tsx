import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useModificarPlanEstimadoForm } from '../../hooks/useModificarPlanEstimadoForm';
import type { PlanEstimado } from '../../models/PlanEstimado';
import type { Tarea } from '../../models/Tarea';
import { formatearDias } from '../../utils/plan-estimado';

const ID_FORMULARIO = 'modificar-plan-estimado';
const FORMULARIO = 'flex flex-col gap-6';
const DATO = 'flex flex-col gap-1';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const VALOR = 'break-words text-base font-medium text-on-surface';

interface Props {
  tarea: Tarea;
  plan: PlanEstimado;
  onCerrar: () => void;
}

export default function ModificarPlanEstimadoPanel({ tarea, plan, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, errores, irAlCampo } =
    useModificarPlanEstimadoForm({ tarea, plan, onCerrar });
  const { register, watch, formState } = form;

  return (
    <SidePanel
      titulo="Editar plan estimado"
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
        aria-label="Edición del plan estimado"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Plan estimado">
          <dl>
            <div className={DATO}>
              <dt className={ETIQUETA}>Días estimados</dt>
              <dd className={VALOR}>{formatearDias(plan.tiempoEstimadoDias)}</dd>
            </div>
          </dl>
          <Notice variante="info">
            Los días estimados no se pueden cambiar; solo puedes editar la descripción.
          </Notice>
          <Field
            etiqueta="Descripción"
            opcional
            error={formState.errors.descripcionEstimado?.message}
            contador={{
              actual: (watch('descripcionEstimado') ?? '').length,
              max: LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX,
            }}
          >
            {(campo) => (
              <textarea
                {...campo}
                {...register('descripcionEstimado')}
                rows={4}
                maxLength={LIMITES.PLAN_ESTIMADO_DESCRIPCION_MAX}
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
