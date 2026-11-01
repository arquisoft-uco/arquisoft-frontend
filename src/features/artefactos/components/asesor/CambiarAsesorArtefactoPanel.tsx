import { useState, type SyntheticEvent } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCambiarAsesorArtefacto } from '../../hooks/useCambiarAsesorArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import {
  MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO,
  esAsesorNoAsignadoAlProyecto,
} from '../../utils/errores-cambio-asesor-artefacto';

const ID_FORMULARIO = 'cambiar-asesor-artefacto';

interface Props {
  artefacto: ArtefactoAsesor;
  onCerrar: () => void;
}

export default function CambiarAsesorArtefactoPanel({ artefacto, onCerrar }: Props) {
  const [seleccion, setSeleccion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [errorCampo, setErrorCampo] = useState<string | undefined>();
  const {
    data: asesores = [],
    isLoading: asesoresCargando,
    isError: asesoresNoDisponibles,
  } = useAsesoresVigentes();
  const { mutate, isPending } = useCambiarAsesorArtefacto();

  const opciones = asesores.map((asesor) => ({
    id: asesor.id,
    etiqueta: asesor.nombre,
    descripcion: asesor.email,
  }));
  const asesorNuevo = asesores.find((asesor) => asesor.id === seleccion);

  function elegir(id: string) {
    setSeleccion(id);
    setErrorCampo(undefined);
  }

  function solicitarConfirmacion(evento: SyntheticEvent) {
    evento.preventDefault();
    if (seleccion) setConfirmando(true);
  }

  function confirmar() {
    mutate(
      { artefactoId: artefacto.id, asesorId: seleccion },
      {
        onSuccess: () => {
          toast.success(
            'Asesor actualizado',
            'El asesor del artefacto fue cambiado correctamente.',
          );
          setConfirmando(false);
          onCerrar();
        },
        onError: (err) => {
          if (esAsesorNoAsignadoAlProyecto(err)) {
            setErrorCampo(MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO);
            toast.error('No se pudo cambiar el asesor', MENSAJE_ASESOR_NO_ASIGNADO_AL_PROYECTO);
          } else {
            toast.error(
              'No se pudo cambiar el asesor',
              getApiErrorMessage(err, 'Inténtalo nuevamente.'),
            );
          }
          setConfirmando(false);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar asesor"
      descripcion={`${artefacto.nombreDocumento} · ${artefacto.nombreProyecto}`}
      onCerrar={onCerrar}
      sucio={seleccion !== ''}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Cambiar asesor"
          accionEnviando="Cambiando…"
          formId={ID_FORMULARIO}
          sucio={seleccion !== ''}
          sinCambios={seleccion === '' || asesoresNoDisponibles || asesoresCargando}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={solicitarConfirmacion} noValidate>
        {asesoresCargando && <Skeleton variante="lineas" etiqueta="Cargando asesores…" />}
        {asesoresNoDisponibles && <AvisoNoDisponible recurso="asesores" />}
        {!asesoresCargando && !asesoresNoDisponibles && (
          <Field
            etiqueta="Nuevo asesor"
            ayuda="Debe estar asignado al proyecto de grado de este artefacto."
            error={errorCampo}
          >
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
      {confirmando && asesorNuevo && (
        <ConfirmDialog
          titulo="¿Cambiar el asesor del artefacto?"
          descripcion={`El nuevo asesor será ${asesorNuevo.nombre} (${asesorNuevo.email}). Es posible que el artefacto deje de aparecer en tus artefactos asignados.`}
          labelConfirmar="Sí, cambiar"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </SidePanel>
  );
}
