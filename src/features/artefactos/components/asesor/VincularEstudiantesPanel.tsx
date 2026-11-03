import { Controller } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useVincularEstudiantesForm } from '../../hooks/useVincularEstudiantesForm';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import SelectorEstudiantesField from './SelectorEstudiantesField';

const ID_FORMULARIO = 'vincular-estudiantes';
const NOTA_CORREO = 'Cada estudiante recibirá un correo.';
const TEXTO_VACIO = 'Todos los estudiantes vigentes del proyecto ya están vinculados';

interface Props {
  artefacto: ArtefactoAsesor;
  onVolver: () => void;
  onSalir: () => void;
}

export default function VincularEstudiantesPanel({ artefacto, onVolver, onSalir }: Props) {
  const { form, enviar, enviando, cerrar, isDirty, vinculables, errores, irAlCampo } =
    useVincularEstudiantesForm({ artefacto, onVolver, onSalir });
  const noDisponible = vinculables.isError;

  return (
    <SidePanel
      titulo="Vincular estudiantes"
      descripcion={`«${artefacto.nombreDocumento}» · ${artefacto.nombreProyecto}`}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Vincular estudiantes"
          accionEnviando="Vinculando…"
          enviando={enviando}
          sucio={isDirty}
          sinCambios={noDisponible || vinculables.estudiantes.length === 0}
          nota={NOTA_CORREO}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Vinculación de estudiantes"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className="flex flex-col gap-6"
      >
        <FormSection titulo="Estudiantes">
          {vinculables.isLoading && <Skeleton variante="lineas" etiqueta="Cargando estudiantes…" />}
          {noDisponible && <AvisoNoDisponible recurso="estudiantes del proyecto" />}
          {!vinculables.isLoading && !noDisponible && (
            <Controller
              name="estudiantes"
              control={form.control}
              render={({ field, fieldState }) => (
                <SelectorEstudiantesField
                  opciones={vinculables.estudiantes}
                  valor={field.value}
                  onCambiar={field.onChange}
                  onBlur={field.onBlur}
                  refCampo={field.ref}
                  error={fieldState.error?.message}
                  textoVacio={TEXTO_VACIO}
                  placeholder="Busca por nombre o correo"
                />
              )}
            />
          )}
        </FormSection>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
