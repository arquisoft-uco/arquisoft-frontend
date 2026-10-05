import { useWatch } from 'react-hook-form';
import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../../shared/validation';
import type { useNuevaFichaForm } from '../../hooks/useNuevaFichaForm';
import NuevaFichaAsesorSeccion from './NuevaFichaAsesorSeccion';
import NuevaFichaEstudiantesSeccion from './NuevaFichaEstudiantesSeccion';

interface Props {
  nueva: ReturnType<typeof useNuevaFichaForm>;
  idFormulario: string;
}

export default function NuevaFichaForm({ nueva, idFormulario }: Props) {
  const { form, enviar, enviando, catalogos } = nueva;
  const titulo = useWatch({ control: form.control, name: 'titulo' }) ?? '';

  return (
    <form
      id={idFormulario}
      aria-label="Registro de ficha de perfil"
      noValidate
      aria-busy={enviando}
      onSubmit={enviar}
      className="flex flex-col gap-6"
    >
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
    </form>
  );
}
