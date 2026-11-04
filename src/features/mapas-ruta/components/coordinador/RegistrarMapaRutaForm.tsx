import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import type { useRegistrarMapaRutaForm } from '../../hooks/useRegistrarMapaRutaForm';
import MapaRutaProyectoSeccion from './MapaRutaProyectoSeccion';

interface Props {
  registro: ReturnType<typeof useRegistrarMapaRutaForm>;
  idFormulario: string;
}

export default function RegistrarMapaRutaForm({ registro, idFormulario }: Props) {
  const { form, enviar, enviando, catalogo } = registro;
  const { errors } = form.formState;

  return (
    <form
      id={idFormulario}
      aria-label="Registro de mapa de ruta"
      noValidate
      aria-busy={enviando}
      onSubmit={enviar}
      className="flex flex-col gap-6"
    >
      <MapaRutaProyectoSeccion control={form.control} catalogo={catalogo} />
      <FormSection titulo="Fechas importantes">
        <Field etiqueta="Fecha de inicio" error={errors.fechaInicio?.message}>
          {(campo) => (
            <input
              {...campo}
              {...form.register('fechaInicio')}
              type="date"
              className="field-input"
            />
          )}
        </Field>
        <Field etiqueta="Fecha de fin" error={errors.fechaFin?.message}>
          {(campo) => (
            <input {...campo} {...form.register('fechaFin')} type="date" className="field-input" />
          )}
        </Field>
      </FormSection>
      <ErrorSummary errores={registro.errores} onIrAlCampo={registro.irAlCampo} />
    </form>
  );
}
