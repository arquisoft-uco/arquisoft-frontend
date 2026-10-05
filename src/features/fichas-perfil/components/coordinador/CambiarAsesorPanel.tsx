import { useState, type SyntheticEvent } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import SelectorAsesorFicha from '../../../../shared/components/SelectorAsesorFicha';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useAsesoresFichaVigentes } from '../../../../shared/hooks/useAsesoresFichaVigentes';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCambiarAsesor } from '../../hooks/useCambiarAsesor';
import type { FichaPerfil } from '../../models/FichaPerfil';

const ID_FORMULARIO = 'cambiar-asesor-ficha';

interface Props {
  ficha: FichaPerfil;
  onCerrar: () => void;
}

export default function CambiarAsesorPanel({ ficha, onCerrar }: Props) {
  const [seleccion, setSeleccion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const { data: asesores = [], isError: asesoresNoDisponibles } = useAsesoresFichaVigentes();
  const { mutate, isPending } = useCambiarAsesor();

  const asesorNuevo = asesores.find((asesor) => asesor.id === seleccion);

  function solicitarConfirmacion(evento: SyntheticEvent) {
    evento.preventDefault();
    if (seleccion) setConfirmando(true);
  }

  function confirmar() {
    if (!asesorNuevo) return;
    mutate(
      { idFicha: ficha.id, idAsesorFicha: seleccion, asesorNuevo },
      {
        onSuccess: () => {
          toast.success('Asesor actualizado', 'El asesor de la ficha fue cambiado correctamente.');
          setConfirmando(false);
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo cambiar el asesor',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          setConfirmando(false);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar asesor"
      descripcion={ficha.tituloProyecto}
      onCerrar={onCerrar}
      sucio={seleccion !== ''}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Cambiar asesor"
          accionEnviando="Cambiando…"
          formId={ID_FORMULARIO}
          sucio={seleccion !== ''}
          sinCambios={seleccion === '' || asesoresNoDisponibles}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={solicitarConfirmacion} noValidate>
        {asesoresNoDisponibles ? (
          <AvisoNoDisponible recurso="asesores" />
        ) : (
          <Field
            etiqueta="Nuevo asesor"
            ayuda={`Asesor actual: ${ficha.asesorFicha.nombre} (${ficha.asesorFicha.email})`}
          >
            {(control) => (
              <SelectorAsesorFicha
                {...control}
                value={seleccion}
                onChange={setSeleccion}
                idsExcluidos={[ficha.asesorFicha.id]}
                placeholder="Selecciona un asesor"
              />
            )}
          </Field>
        )}
      </form>
      {confirmando && asesorNuevo && (
        <ConfirmDialog
          titulo="¿Cambiar asesor de la ficha?"
          descripcion={`El nuevo asesor será ${asesorNuevo.nombre} (${asesorNuevo.email}). Esta acción reemplazará al asesor actual.`}
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
