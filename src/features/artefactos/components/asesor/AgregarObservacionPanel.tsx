import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useAgregarObservacionForm } from '../../hooks/useAgregarObservacionForm';
import type { VersionArtefacto } from '../../models/VersionArtefacto';

const ID_FORMULARIO = 'agregar-observacion-revision';

interface Props {
  revisionAsesorId: string;
  version: VersionArtefacto;
  onVolver: () => void;
  onSalir: () => void;
}

export default function AgregarObservacionPanel({
  revisionAsesorId,
  version,
  onVolver,
  onSalir,
}: Props) {
  const { form, enviar, enviando, cerrar, isDirty, errores, irAlCampo } = useAgregarObservacionForm(
    { revisionAsesorId, onVolver, onSalir },
  );
  const { register, watch, formState } = form;

  return (
    <SidePanel
      titulo="Agregar observación"
      descripcion={`«${version.nombreDocumento}» · Versión ${version.version}`}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Agregar observación"
          accionEnviando="Agregando…"
          enviando={enviando}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Nueva observación"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className="flex flex-col gap-5"
      >
        <Field
          etiqueta="Descripción"
          error={formState.errors.descripcion?.message}
          contador={{
            actual: watch('descripcion').length,
            max: LIMITES.OBSERVACION_REVISION_ARTEFACTO_MAX,
          }}
        >
          {(control) => (
            <textarea
              rows={6}
              maxLength={LIMITES.OBSERVACION_REVISION_ARTEFACTO_MAX}
              className="field-input"
              {...register('descripcion')}
              {...control}
            />
          )}
        </Field>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
