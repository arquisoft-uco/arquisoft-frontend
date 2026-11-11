import { useId } from 'react';
import { CircleCheck } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import { useFinalizacionProyecto } from '../../hooks/useFinalizacionProyecto';
import { useUltimoEntregableProyectoGrado } from '../../hooks/useUltimoEntregableProyectoGrado';
import { esEntregableDefinitivo, mensajeUltimoEntregable } from '../../utils/ultimo-entregable';
import ConfirmarFinalizacionDialog from './ConfirmarFinalizacionDialog';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  onFinalizado: () => void;
}

export default function AccionesProyectoGradoAsesor({
  proyectoGradoId,
  titulo,
  onFinalizado,
}: Props) {
  const idAviso = useId();
  const { data, isLoading, error, refetch } = useUltimoEntregableProyectoGrado(proyectoGradoId);
  const finalizacion = useFinalizacionProyecto({ proyectoGradoId, onFinalizado });
  const puedeFinalizar = !isLoading && !error && esEntregableDefinitivo(data?.estadoEntregable.id);
  const hayAviso = !isLoading && (Boolean(error) || !puedeFinalizar);

  return (
    <>
      <Button
        variante="secundario"
        tamano="sm"
        icono={CircleCheck}
        className="mt-4"
        disabled={!puedeFinalizar}
        cargando={isLoading}
        aria-describedby={hayAviso ? idAviso : undefined}
        onClick={finalizacion.solicitar}
      >
        Finalizar proyecto
      </Button>
      {hayAviso && (
        <div id={idAviso}>
          {error ? (
            <Notice
              variante="advertencia"
              accion={{ etiqueta: 'Reintentar', onClick: () => void refetch() }}
            >
              No pudimos verificar el último entregable.
            </Notice>
          ) : (
            <Notice variante="info">{mensajeUltimoEntregable(data ?? null)}</Notice>
          )}
        </div>
      )}
      {finalizacion.abierto && (
        <ConfirmarFinalizacionDialog
          titulo={titulo}
          frase={finalizacion.frase}
          onCambiarFrase={finalizacion.cambiarFrase}
          fraseCoincide={finalizacion.fraseCoincide}
          finalizando={finalizacion.finalizando}
          onConfirmar={finalizacion.confirmar}
          onCancelar={finalizacion.cerrar}
        />
      )}
    </>
  );
}
