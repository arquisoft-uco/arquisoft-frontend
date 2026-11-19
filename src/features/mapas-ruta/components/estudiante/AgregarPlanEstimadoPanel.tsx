import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useAgregarPlanEstimadoForm } from '../../hooks/useAgregarPlanEstimadoForm';
import type { Tarea } from '../../models/Tarea';
import { plazoMapaRutaEnDias } from '../../utils/plan-estimado';

const ID_FORMULARIO = 'agregar-plan-estimado';
const FORMULARIO = 'flex flex-col gap-6';

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
}

export default function AgregarPlanEstimadoPanel({ tarea, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, errores, irAlCampo } =
    useAgregarPlanEstimadoForm({ tarea, onCerrar });
  const { register, watch, formState } = form;

  const plazo = plazoMapaRutaEnDias(tarea.fechaInicioMapaRuta, tarea.fechaFinMapaRuta);
  const ayudaDias =
    plazo === null
      ? undefined
      : `El plazo de tu mapa de ruta es de ${plazo} días; la suma de los planes de todas tus tareas no puede superarlo.`;

  return (
    <SidePanel
      titulo="Agregar plan estimado"
      descripcion={tarea.descripcion}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Agregar plan estimado"
          accionEnviando="Agregando…"
          enviando={enviando}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Agregar plan estimado"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Plan estimado">
          <Field
            etiqueta="Días estimados"
            corto
            ayuda={ayudaDias}
            error={formState.errors.tiempoEstimadoDias?.message}
          >
            {(campo) => (
              <input
                {...campo}
                {...register('tiempoEstimadoDias')}
                type="text"
                inputMode="numeric"
                className="field-input"
              />
            )}
          </Field>
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
