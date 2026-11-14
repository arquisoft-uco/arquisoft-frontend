import { useState } from 'react';
import { Ban, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { useCancelacionProyecto } from '../../hooks/useCancelacionProyecto';
import { puedeCancelarProyecto } from '../../utils/estados-proyecto';
import ConfirmarCancelacionDialog from './ConfirmarCancelacionDialog';
import EstudiantesProyectoGradoPanel from './EstudiantesProyectoGradoPanel';
import MotivoCancelacionDialog from './MotivoCancelacionDialog';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  estadoId?: string;
  soloLectura?: boolean;
  onCancelado: () => void;
}

export default function AccionesProyectoGradoCoordinador({
  proyectoGradoId,
  titulo,
  estadoId,
  soloLectura = false,
  onCancelado,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const cancelacion = useCancelacionProyecto({ proyectoGradoId, onCancelado });

  return (
    <>
      <Button variante="secundario" icono={Users} onClick={() => setAbierto(true)}>
        Ver estudiantes
      </Button>
      {puedeCancelarProyecto(estadoId) && (
        <Button
          variante="peligroContorno"
          tamano="sm"
          icono={Ban}
          className="mt-4"
          onClick={cancelacion.solicitar}
        >
          Cancelar proyecto
        </Button>
      )}
      {abierto && (
        <EstudiantesProyectoGradoPanel
          proyectoGradoId={proyectoGradoId}
          titulo={titulo}
          soloLectura={soloLectura}
          onCerrar={() => setAbierto(false)}
        />
      )}
      {cancelacion.paso === 'motivo' && (
        <MotivoCancelacionDialog
          titulo={titulo}
          formulario={cancelacion.formulario}
          onContinuar={cancelacion.continuar}
          onCerrar={cancelacion.cerrar}
        />
      )}
      {cancelacion.paso === 'confirmacion' && (
        <ConfirmarCancelacionDialog
          titulo={titulo}
          frase={cancelacion.frase}
          onCambiarFrase={cancelacion.cambiarFrase}
          fraseCoincide={cancelacion.fraseCoincide}
          cancelando={cancelacion.cancelando}
          onConfirmar={cancelacion.confirmar}
          onVolver={cancelacion.volver}
        />
      )}
    </>
  );
}
