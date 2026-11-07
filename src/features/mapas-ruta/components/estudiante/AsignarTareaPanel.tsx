import { useRef } from 'react';
import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useAsignarTareaForm } from '../../hooks/useAsignarTareaForm';
import type { MapaRuta } from '../../models/MapaRuta';
import CamposInformacionTarea from './CamposInformacionTarea';

const ID_FORMULARIO = 'asignar-tarea';
const FORMULARIO = 'flex flex-col gap-6';

interface Props {
  mapa: MapaRuta;
  onCerrar: () => void;
}

export default function AsignarTareaPanel({ mapa, onCerrar }: Props) {
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
  } = useAsignarTareaForm({ mapa, onCerrar });
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
      titulo="Nueva tarea"
      descripcion={mapa.titulo}
      sucio={isDirty}
      ocupado={enviando}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Asignar tarea"
          accionEnviando="Asignando…"
          enviando={enviando}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Nueva tarea"
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
          descripcionErrorAsesores="Puedes volver a intentarlo; sin asesor no se puede asignar la tarea."
          grupoAsesor={grupoAsesor}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irA} />
      </form>
    </SidePanel>
  );
}
