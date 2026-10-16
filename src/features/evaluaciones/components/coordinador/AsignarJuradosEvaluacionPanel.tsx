import { useState, type FormEvent } from 'react';
import ComboboxElegidos from '../../../../shared/components/ui/ComboboxElegidos';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsignarJuradosEvaluacion } from '../../hooks/useAsignarJuradosEvaluacion';
import type { Evaluacion } from '../../models/Evaluacion';
import type { JuradoVigente } from '../../models/JuradoVigente';
import { mensajeErrorAsignacionJurados } from '../../utils/errores-asignacion-jurados';
import JuradosDisponiblesLista from './JuradosDisponiblesLista';

const ID_FORMULARIO = 'form-asignar-jurados-evaluacion';
const CUERPO = 'flex flex-col gap-6';
const AYUDA = 'text-sm text-on-surface-secondary';

interface Props {
  evaluacion: Evaluacion;
  onCerrar: () => void;
}

export default function AsignarJuradosEvaluacionPanel({ evaluacion, onCerrar }: Props) {
  const [seleccion, setSeleccion] = useState<JuradoVigente[]>([]);
  const { mutate, isPending } = useAsignarJuradosEvaluacion(evaluacion.id);

  const elegidosIds = new Set(seleccion.map((jurado) => jurado.id));
  const nombresPorId = new Map(seleccion.map((jurado) => [jurado.id, jurado.nombre]));
  const opcionesElegidas = seleccion.map(({ id, nombre, email }) => ({
    id,
    etiqueta: nombre,
    descripcion: email,
  }));

  function alternar(jurado: JuradoVigente) {
    setSeleccion((actual) =>
      actual.some((elegido) => elegido.id === jurado.id)
        ? actual.filter((elegido) => elegido.id !== jurado.id)
        : [...actual, jurado],
    );
  }

  function quitar(id: string) {
    setSeleccion((actual) => actual.filter((elegido) => elegido.id !== id));
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (seleccion.length === 0) return;
    mutate(
      seleccion.map((jurado) => jurado.id),
      {
        onSuccess: () => {
          toast.success('Jurados asignados', 'Los jurados se asignaron a la evaluación.');
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudieron asignar los jurados',
            mensajeErrorAsignacionJurados(err, nombresPorId),
          );
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Asignar jurados"
      descripcion={`${evaluacion.entregable.proyecto} · versión ${evaluacion.entregable.version}`}
      onCerrar={onCerrar}
      sucio={seleccion.length > 0}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Asignar jurados"
          accionEnviando="Asignando…"
          formId={ID_FORMULARIO}
          sucio={seleccion.length > 0}
          sinCambios={seleccion.length === 0}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <div className={CUERPO}>
        <form id={ID_FORMULARIO} onSubmit={enviar} noValidate>
          <FormSection titulo={`Jurados elegidos (${seleccion.length})`}>
            <Notice variante="info">
              Los jurados que ya están asignados a esta evaluación no se muestran. Si eliges alguno,
              te indicaremos cuál.
            </Notice>
            {seleccion.length === 0 ? (
              <p className={AYUDA}>Aún no has elegido jurados.</p>
            ) : (
              <ComboboxElegidos
                etiqueta="Jurados por asignar"
                elegidos={opcionesElegidas}
                onQuitar={quitar}
              />
            )}
          </FormSection>
        </form>
        <FormSection titulo="Jurados disponibles">
          <JuradosDisponiblesLista elegidosIds={elegidosIds} onAlternar={alternar} />
        </FormSection>
      </div>
    </SidePanel>
  );
}
