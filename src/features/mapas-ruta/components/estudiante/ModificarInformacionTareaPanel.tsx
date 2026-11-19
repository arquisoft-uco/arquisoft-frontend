import { useRef } from 'react';
import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useModificarInformacionTareaForm } from '../../hooks/useModificarInformacionTareaForm';
import type { Tarea } from '../../models/Tarea';
import CamposInformacionTarea from './CamposInformacionTarea';

const ID_FORMULARIO = 'modificar-informacion-tarea';
const FORMULARIO = 'flex flex-col gap-6';

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
}

export default function ModificarInformacionTareaPanel({ tarea, onCerrar }: Props) {
  const {
    form,
    enviar,
    enviando,
    cerrar,
    isDirty,
    errores,
    irAlCampo,
    asesor,
    elegirAsesor,
    opcionesAsesor,
    cargandoAsesores,
    errorAsesores,
    reintentarAsesores,
  } = useModificarInformacionTareaForm({ tarea, onCerrar });
  const grupoAsesor = useRef<HTMLDivElement>(null);

  function irA(campo: string) {
    if (campo !== 'asesor') {
      irAlCampo(campo);
      return;
    }
    const grupo = grupoAsesor.current;
    const radio = grupo?.querySelector<HTMLInputElement>('input:checked, input');
    (radio ?? grupo)?.focus();
  }

  return (
    <SidePanel
      titulo="Editar tarea"
      descripcion={tarea.descripcion}
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
        aria-label="Edición de la tarea"
        noValidate
        aria-busy={enviando}
        onSubmit={enviar}
        className={FORMULARIO}
      >
        <CamposInformacionTarea
          form={form}
          asesor={asesor}
          elegirAsesor={elegirAsesor}
          opcionesAsesor={opcionesAsesor}
          cargandoAsesores={cargandoAsesores}
          errorAsesores={errorAsesores}
          reintentarAsesores={reintentarAsesores}
          descripcionErrorAsesores="Puedes seguir editando la descripción; el asesor actual se conserva."
          grupoAsesor={grupoAsesor}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irA} />
      </form>
    </SidePanel>
  );
}
