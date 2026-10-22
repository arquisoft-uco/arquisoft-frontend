import { useState, type ComponentProps } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesEnviadas from './ListadoSolicitudesEnviadas';
import type { TipoSolicitudEnviableUi } from './SelectorTipoSolicitud';

const RAIZ = 'flex flex-col gap-4';

const MENSAJE_ELIMINADA: Record<TipoSolicitudEnviableUi, string> = {
  coordinador: 'La solicitud de novedad fue eliminada correctamente.',
  asesor: 'La solicitud de novedad fue eliminada correctamente.',
  'cambio-asesor': 'La solicitud de cambio de asesor fue eliminada correctamente.',
};

interface OpcionesEliminar {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

interface Props {
  tipo: TipoSolicitudEnviableUi;
  consulta: ComponentProps<typeof ListadoSolicitudesEnviadas>['consulta'];
  eliminar: (id: string, opciones: OpcionesEliminar) => void;
  eliminando: boolean;
}

export default function ListadoSolicitudesEnviadasEliminable({
  tipo,
  consulta,
  eliminar,
  eliminando,
}: Props) {
  const [pendienteEliminar, setPendienteEliminar] = useState<Solicitud | null>(null);

  function handleConfirmarEliminar() {
    if (!pendienteEliminar) return;
    eliminar(pendienteEliminar.id, {
      onSuccess: () => {
        toast.success('Solicitud eliminada', MENSAJE_ELIMINADA[tipo]);
        setPendienteEliminar(null);
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la solicitud',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        setPendienteEliminar(null);
      },
    });
  }

  function handleCancelarEliminar() {
    if (eliminando) return;
    setPendienteEliminar(null);
  }

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesEnviadas
        tipo={tipo}
        consulta={consulta}
        eliminando={eliminando}
        onEliminar={setPendienteEliminar}
      />

      {pendienteEliminar && (
        <ConfirmDialog
          variante="peligro"
          titulo="¿Eliminar solicitud?"
          descripcion={`Vas a eliminar la solicitud enviada a ${pendienteEliminar.destinatario.nombre}.`}
          consecuencias={[
            'Dejará de aparecer en tus solicitudes enviadas.',
            'No se puede deshacer.',
          ]}
          labelConfirmar="Eliminar"
          cargando={eliminando}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={handleCancelarEliminar}
        />
      )}
    </div>
  );
}
