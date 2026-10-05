import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../../shared/validation';
import type { useNuevaFichaForm } from '../../hooks/useNuevaFichaForm';
import NuevaFichaAsesorSeccion from './NuevaFichaAsesorSeccion';
import NuevaFichaEstudiantesSeccion from './NuevaFichaEstudiantesSeccion';

interface Props {
  nueva: ReturnType<typeof useNuevaFichaForm>;
  titulo: string;
  onCancelar: () => void;
}

export default function NuevaFichaForm({ nueva, titulo, onCancelar }: Props) {
  const { form, enviar, enviando, isDirty, catalogos, catalogoNoDisponible } = nueva;

  return (
    <form onSubmit={enviar} noValidate>
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <FormSection titulo="Proyecto">
          <Field
            etiqueta="Título del proyecto"
            ayuda="Es el nombre con el que se conocerá la ficha."
            error={form.formState.errors.titulo?.message}
            contador={{ actual: titulo.length, max: LIMITES.TITULO_PROYECTO_MAX }}
          >
            {(campo) => (
              <input
                {...campo}
                {...form.register('titulo')}
                type="text"
                className="field-input"
                maxLength={LIMITES.TITULO_PROYECTO_MAX}
              />
            )}
          </Field>
        </FormSection>
        <NuevaFichaAsesorSeccion control={form.control} catalogo={catalogos.asesores} />
        <NuevaFichaEstudiantesSeccion control={form.control} catalogo={catalogos.estudiantes} />
        <ErrorSummary errores={nueva.errores} onIrAlCampo={nueva.irAlCampo} />
      </div>
      <FormActions
        accion="Registrar ficha"
        accionEnviando="Registrando…"
        enviando={enviando}
        sucio={isDirty}
        sinCambios={catalogoNoDisponible}
        onCancelar={onCancelar}
      />
    </form>
  );
}
