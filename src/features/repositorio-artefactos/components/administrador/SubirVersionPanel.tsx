import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useSubirVersionForm } from '../../hooks/useSubirVersionForm';
import { textoDeAvanceSubida } from '../../../../shared/utils/avance-subida';
import { ETIQUETAS_CAMPO_VERSION } from '../../utils/version-schema';
import SubirVersionCampos from './SubirVersionCampos';

const ID_FORMULARIO = 'subir-version';
const FORMULARIO = 'flex flex-col gap-6';
const AVANCE = 'text-sm text-on-surface-secondary';

interface Props {
  repositorioId: string;
  onCerrar: () => void;
}

export default function SubirVersionPanel({ repositorioId, onCerrar }: Props) {
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
    documentosExistentes,
    cargandoDocumentos,
    elegirArchivo,
    cambiarModo,
  } = useSubirVersionForm({ repositorioId, onCerrar });
  const errores = resumenVisible
    ? resumirErrores(form.formState.errors, ETIQUETAS_CAMPO_VERSION)
    : [];

  return (
    <SidePanel
      titulo="Subir versión"
      descripcion="Carga un archivo como documento nuevo o como nueva versión de uno existente."
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
        aria-label="Subida de versión"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <SubirVersionCampos
          form={form}
          documentosExistentes={documentosExistentes}
          cargandoDocumentos={cargandoDocumentos}
          enviando={enviando}
          onElegirArchivo={elegirArchivo}
          onCambiarModo={cambiarModo}
        />
        <div aria-live="polite">
          {enviando && <p className={AVANCE}>{textoDeAvanceSubida(fase, porcentaje)}</p>}
        </div>
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
