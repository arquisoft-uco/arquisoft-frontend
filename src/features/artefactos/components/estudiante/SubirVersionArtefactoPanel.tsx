import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SelectorArchivo from '../../../../shared/components/ui/SelectorArchivo';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { textoDeAvanceSubida } from '../../../../shared/utils/avance-subida';
import { useSubirVersionArtefactoForm } from '../../hooks/useSubirVersionArtefactoForm';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import { ACEPTA_VERSION_ARTEFACTO } from '../../utils/tipos-archivo-version-artefacto';
import { ETIQUETAS_CAMPO_VERSION_ARTEFACTO } from '../../utils/version-artefacto-schema';

const ID_FORMULARIO = 'subir-version-artefacto';
const FORMULARIO = 'flex flex-col gap-6';
const CONTEXTO = 'flex flex-col gap-1 text-sm text-on-surface-secondary';
const CONTEXTO_NOMBRE = 'font-medium text-on-surface';
const AVANCE = 'text-sm text-on-surface-secondary';

interface Props {
  artefacto: ArtefactoParaVersion;
  onCerrar: () => void;
}

export default function SubirVersionArtefactoPanel({ artefacto, onCerrar }: Props) {
  const {
    form,
    enviar,
    enviando,
    fase,
    porcentaje,
    cerrar,
    isDirty,
    resumenVisible,
    irAlCampo,
    elegirArchivo,
    errorDeNegocio,
  } = useSubirVersionArtefactoForm({ artefacto, onCerrar });
  const archivo = form.watch('archivo');
  const errores = resumenVisible
    ? resumirErrores(form.formState.errors, ETIQUETAS_CAMPO_VERSION_ARTEFACTO)
    : [];

  return (
    <SidePanel
      titulo="Subir nueva versión"
      descripcion={`${artefacto.nombreDocumento} · ${artefacto.nombreProyecto}`}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Subir versión"
          accionEnviando="Subiendo…"
          enviando={enviando}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Subida de versión del artefacto"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <FormSection titulo="Artefacto">
          <div className={CONTEXTO}>
            <p className={CONTEXTO_NOMBRE}>{artefacto.nombreDocumento}</p>
            <p>{artefacto.nombreProyecto}</p>
            <p>Versión actual: {artefacto.versionDocumento}</p>
          </div>
        </FormSection>
        <FormSection titulo="Archivo">
          <Field
            etiqueta={ETIQUETAS_CAMPO_VERSION_ARTEFACTO.archivo}
            ayuda="PDF, DOCX, XLSX, PPTX, MD, TXT, DRAWIO, PNG o JPG. Máximo 5 MB."
            error={form.formState.errors.archivo?.message}
          >
            {(control) => (
              <SelectorArchivo
                control={control}
                archivo={archivo}
                onElegir={elegirArchivo}
                acepta={ACEPTA_VERSION_ARTEFACTO}
                deshabilitado={enviando}
              />
            )}
          </Field>
        </FormSection>
        <div aria-live="polite">
          {enviando && <p className={AVANCE}>{textoDeAvanceSubida(fase, porcentaje)}</p>}
        </div>
        {errorDeNegocio && <Notice variante="peligro">{errorDeNegocio}</Notice>}
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
