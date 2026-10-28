import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useCambiarFechaFinMapaRutaForm } from '../../hooks/useCambiarFechaFinMapaRutaForm';
import type { MapaRuta } from '../../models/MapaRuta';
import { formatearFechaCivil } from '../../utils/formato-fecha';

const ID_FORMULARIO = 'cambiar-fecha-fin-mapa-ruta';
const FORMULARIO = 'flex flex-col gap-6';
const FRASE = 'text-sm text-on-surface-secondary';
const ETIQUETAS_CAMPO = { fechaFin: 'Fecha de fin' };

interface Props {
  mapa: MapaRuta;
  onCerrar: () => void;
}

export default function CambiarFechaFinMapaRutaPanel({ mapa, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, resumenVisible, irAlCampo } =
    useCambiarFechaFinMapaRutaForm({ mapa, onCerrar });
  const { register, formState } = form;
  const errores = resumenVisible ? resumirErrores(formState.errors, ETIQUETAS_CAMPO) : [];

  return (
    <SidePanel
      titulo="Cambiar fecha de fin"
      descripcion={mapa.titulo}
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
        aria-label="Cambio de fecha de fin"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Fechas importantes">
          <p className={FRASE}>
            Fecha de inicio: {formatearFechaCivil(mapa.fechaInicio)}. No se puede cambiar.
          </p>
          <Field etiqueta="Fecha de fin" error={formState.errors.fechaFin?.message}>
            {(campo) => (
              <input {...campo} {...register('fechaFin')} type="date" className="field-input" />
            )}
          </Field>
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
