import { CheckCheck } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { useEnviarCorreccionesRevisionItem } from '../../hooks/useEnviarCorreccionesRevisionItem';
import { useMarcarRevisionItemVisualizada } from '../../hooks/useMarcarRevisionItemVisualizada';
import { useObservacionesDeRevisionesMiFicha } from '../../hooks/useObservacionesDeRevisionesMiFicha';
import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import { motivoCorreccionesNoDisponibles } from '../../utils/correcciones-revision';
import { mensajeErrorCorrecciones } from '../../utils/errores-correcciones-revision';
import {
  ESTADO_REVISION_EN_PROGRESO,
  ESTADO_REVISION_NUEVA,
  ESTADO_REVISION_VISUALIZADA,
} from '../../utils/estado-revision';
import RevisionesFichaTabla from '../RevisionesFichaTabla';
import EnviarCorreccionesRevisionBoton from './EnviarCorreccionesRevisionBoton';

function mensajeError(err: unknown): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_CERRADA')) {
    return 'La revisión está cerrada y ya no admite cambios.';
  }
  if (hasApiErrorCode(err, 'REVISION_ITEM_NO_ENCONTRADA')) return 'La revisión ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PROPIETARIO')) return 'Esta revisión no pertenece a tu ficha.';
  return getApiErrorMessage(err, 'No se pudo marcar la revisión como visualizada.');
}

export default function RevisionesMiFichaPanel() {
  const revisiones = useRevisionesMiFicha();
  const marcar = useMarcarRevisionItemVisualizada();
  const enviarCorrecciones = useEnviarCorreccionesRevisionItem();
  const idsEnProgreso = revisiones.filas
    .filter((f) => f.revision.estadoId === ESTADO_REVISION_EN_PROGRESO)
    .map((f) => f.revision.id);
  const { resumenPorRevision, cargando: cargandoObservaciones } =
    useObservacionesDeRevisionesMiFicha(idsEnProgreso);

  function marcarVisualizada(revisionItemId: string) {
    marcar.mutate(revisionItemId, {
      onSuccess: () => toast.success('Revisión marcada como visualizada'),
      onError: (err) => toast.error('No se pudo marcar la revisión', mensajeError(err)),
    });
  }

  function enviar(revisionItemId: string) {
    enviarCorrecciones.mutate(revisionItemId, {
      onSuccess: () => toast.success('Correcciones enviadas', 'Tu asesor ya puede validarlas.'),
      onError: (err) =>
        toast.error('No se pudieron enviar las correcciones', mensajeErrorCorrecciones(err)),
    });
  }

  return (
    <RevisionesFichaTabla
      {...revisiones}
      tituloVacio="Tu ficha aún no tiene revisiones"
      descripcionVacia="Cuando tu asesor revise un ítem y deje observaciones, lo verás aquí."
      acciones={(fila) => {
        const { id, estadoId } = fila.revision;
        const etiquetaItem = fila.item?.tipoItem.nombre ?? 'un ítem';

        if (estadoId === ESTADO_REVISION_NUEVA) {
          return (
            <Button
              variante="fantasma"
              tamano="sm"
              icono={CheckCheck}
              aria-label={`Marcar como visualizada la revisión de ${etiquetaItem}`}
              cargando={marcar.isPending && marcar.variables === id}
              onClick={() => marcarVisualizada(id)}
            >
              <span className="sm:hidden">Visualizada</span>
              <span className="hidden sm:inline">Marcar como visualizada</span>
            </Button>
          );
        }

        if (estadoId === ESTADO_REVISION_VISUALIZADA || estadoId === ESTADO_REVISION_EN_PROGRESO) {
          const verificando = estadoId === ESTADO_REVISION_EN_PROGRESO && cargandoObservaciones;
          const motivo = verificando
            ? 'Verificando observaciones…'
            : motivoCorreccionesNoDisponibles(estadoId, resumenPorRevision.get(id));
          return (
            <EnviarCorreccionesRevisionBoton
              idRevision={id}
              etiquetaItem={etiquetaItem}
              motivo={motivo}
              cargando={enviarCorrecciones.isPending && enviarCorrecciones.variables === id}
              onEnviar={() => enviar(id)}
            />
          );
        }

        return null;
      }}
    />
  );
}
