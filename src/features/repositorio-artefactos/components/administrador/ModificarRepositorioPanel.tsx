import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useModificarRepositorioForm } from '../../hooks/useModificarRepositorioForm';
import type { RepositorioArtefacto } from '../../models/RepositorioArtefacto';
import { ETIQUETAS_CAMPO } from '../../utils/repositorio-schema';
import RepositorioCampos from './RepositorioCampos';

const ID_FORMULARIO = 'modificar-repositorio';
const FORMULARIO = 'flex flex-col gap-6';
const FRASE = 'text-sm text-on-surface-secondary';

interface Props {
  repositorio: RepositorioArtefacto;
  onCerrar: () => void;
}

export default function ModificarRepositorioPanel({ repositorio, onCerrar }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, resumenVisible, irAlCampo } =
    useModificarRepositorioForm({ repositorio, onCerrar });
  const { register, watch, formState } = form;
  const errores = resumenVisible ? resumirErrores(formState.errors, ETIQUETAS_CAMPO) : [];

  return (
    <SidePanel
      titulo="Editar repositorio"
      descripcion="Cambia el nombre o la descripción del repositorio."
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
        aria-label="Edición de repositorio"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <p className={FRASE}>Ambos campos son obligatorios.</p>
        <RepositorioCampos
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
