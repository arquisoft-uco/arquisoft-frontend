import { useState, type SyntheticEvent } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsignarAsesorEvaluacion } from '../../hooks/useAsignarAsesorEvaluacion';
import type { EntregableEvaluacion, Evaluacion } from '../../models/Evaluacion';
import {
  esAsesorNoEncontrado,
  mensajeErrorAsignarAsesorEvaluacion,
} from '../../utils/errores-asignar-asesor-evaluacion';

const ID_FORMULARIO = 'form-asignar-asesor-evaluacion';

type EvaluacionAsignable = Pick<Evaluacion, 'id'> & {
  entregable: Pick<EntregableEvaluacion, 'proyecto' | 'version'>;
};

interface Props {
  evaluacion: EvaluacionAsignable;
  onCerrar: () => void;
}

export default function AsignarAsesorEvaluacionPanel({ evaluacion, onCerrar }: Props) {
  const [seleccion, setSeleccion] = useState('');
  const [errorCampo, setErrorCampo] = useState<string | undefined>();
  const {
    data: asesores = [],
    isLoading: asesoresCargando,
    isError: asesoresNoDisponibles,
  } = useAsesoresVigentes();
  const { mutate, isPending } = useAsignarAsesorEvaluacion(evaluacion.id);

  const opciones = asesores.map((asesor) => ({
    id: asesor.id,
    etiqueta: asesor.nombre,
    descripcion: asesor.email,
  }));

  function elegir(id: string) {
    setSeleccion(id);
    setErrorCampo(undefined);
  }

  function enviar(evento: SyntheticEvent) {
    evento.preventDefault();
    if (!seleccion) return;
    mutate(seleccion, {
      onSuccess: () => {
        toast.success('Asesor asignado', 'El asesor se asignó a la evaluación.');
        onCerrar();
      },
      onError: (err) => {
        const mensaje = mensajeErrorAsignarAsesorEvaluacion(err);
        toast.error('No se pudo asignar el asesor', mensaje);
        if (esAsesorNoEncontrado(err)) setErrorCampo(mensaje);
      },
    });
  }

  return (
    <SidePanel
      titulo="Asignar asesor"
      descripcion={`${evaluacion.entregable.proyecto} · versión ${evaluacion.entregable.version}`}
      onCerrar={onCerrar}
      sucio={seleccion !== ''}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Asignar asesor"
          accionEnviando="Asignando…"
          formId={ID_FORMULARIO}
          sucio={seleccion !== ''}
          sinCambios={seleccion === '' || asesoresCargando || asesoresNoDisponibles}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={enviar} noValidate className="flex flex-col gap-6">
        <Notice variante="info">
          Si la evaluación ya tiene un asesor, será reemplazado por el que elijas. Solo se puede
          cambiar si el asesor actual aún no registró evaluaciones.
        </Notice>
        {asesoresCargando && <Skeleton variante="lineas" etiqueta="Cargando asesores…" />}
        {asesoresNoDisponibles && <AvisoNoDisponible recurso="asesores" />}
        {!asesoresCargando && !asesoresNoDisponibles && (
          <Field etiqueta="Asesor" error={errorCampo}>
            {(control) => (
              <Combobox
                {...control}
                valor={seleccion}
                onCambiar={elegir}
                opciones={opciones}
                etiquetaElegidos="Asesor elegido"
                textoVacio="No hay asesores que coincidan."
                placeholder="Busca por nombre o correo"
              />
            )}
          </Field>
        )}
      </form>
    </SidePanel>
  );
}
