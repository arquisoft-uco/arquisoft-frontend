import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useAportarPlanRealForm } from '../../hooks/useAportarPlanRealForm';
import type { PlanRealProyecto } from '../../models/PlanRealProyecto';
import { formatearDias } from '../../utils/plan-estimado';

const ID_FORMULARIO = 'aportar-plan-real';
const FORMULARIO = 'flex flex-col gap-6';
const DATO = 'flex flex-col gap-1';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const VALOR = 'break-words text-base font-medium text-on-surface';

interface Props {
  proyectoGradoId: string;
  plan: PlanRealProyecto;
  onCerrar: () => void;
}

export default function AportarPlanRealPanel({ proyectoGradoId, plan, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, errores, irAlCampo } = useAportarPlanRealForm({
    proyectoGradoId,
    plan,
    onCerrar,
  });
  const { register, watch, formState } = form;

  return (
    <SidePanel
      titulo="Aportar al plan real"
      descripcion={plan.descripcionTarea}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Guardar aporte"
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
        aria-label="Aporte al plan real"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Plan real">
          <dl>
            <div className={DATO}>
              <dt className={ETIQUETA}>Días reales</dt>
              <dd className={VALOR}>{formatearDias(plan.tiempoRealDias)}</dd>
            </div>
          </dl>
          <Notice variante="info">
            El aporte reemplaza la descripción del plan; los días reales no cambian.
          </Notice>
          <Field
            etiqueta="Descripción"
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
