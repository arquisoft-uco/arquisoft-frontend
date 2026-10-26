import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useGenerarRepositorioForm } from '../../hooks/useGenerarRepositorioForm';
import GenerarRepositorioCampos from './GenerarRepositorioCampos';
import { ETIQUETAS_CAMPO } from '../../utils/generar-repositorio-schema';

const ID_FORMULARIO = 'generar-repositorio';
const FORMULARIO = 'flex flex-col gap-6';
const FRASE = 'text-sm text-on-surface-secondary';

interface Props {
  onCerrar: () => void;
}

export default function GenerarRepositorioPanel({ onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, resumenVisible, irAlCampo } =
    useGenerarRepositorioForm({ onCerrar });
  const { register, watch, formState } = form;
  const errores = resumenVisible ? resumirErrores(formState.errors, ETIQUETAS_CAMPO) : [];

  return (
    <SidePanel
      titulo="Generar repositorio"
      descripcion="Crea un repositorio de artefactos nuevo."
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Generar repositorio"
          accionEnviando="Generando…"
          enviando={enviando}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Generación de repositorio"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <p className={FRASE}>Ambos campos son obligatorios. Quedas a cargo del repositorio.</p>
        <GenerarRepositorioCampos
          register={register}
          errors={formState.errors}
          longitudNombre={(watch('nombreRepositorio') ?? '').length}
          longitudDescripcion={(watch('descripcion') ?? '').length}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
