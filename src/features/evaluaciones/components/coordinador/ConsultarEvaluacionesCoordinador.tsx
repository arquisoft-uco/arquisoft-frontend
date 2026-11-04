import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import { useEvaluacionesCoordinador } from '../../hooks/useEvaluacionesCoordinador';
import type { Evaluacion } from '../../models/Evaluacion';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import ListadoEvaluaciones from '../ListadoEvaluaciones';
import AsignarJuradosEvaluacionPanel from './AsignarJuradosEvaluacionPanel';

export default function ConsultarEvaluacionesCoordinador() {
  const listado = useEvaluacionesCoordinador();
  const [evaluacionAsignando, setEvaluacionAsignando] = useState<Evaluacion | null>(null);

  return (
    <>
      <ListadoEvaluaciones
        listado={listado}
        encabezadoAcciones="Acciones"
        acciones={(evaluacion) => (
          <IconButton
            etiqueta={`Asignar jurados a ${evaluacion.entregable.proyecto}`}
            icono={UserPlus}
            tono="primario"
            rotulo="Asignar jurados"
            disabled={evaluacion.estado.id === ESTADO_FINALIZADA}
            onClick={() => setEvaluacionAsignando(evaluacion)}
          />
        )}
      />

      {evaluacionAsignando && (
        <AsignarJuradosEvaluacionPanel
          evaluacion={evaluacionAsignando}
          onCerrar={() => setEvaluacionAsignando(null)}
        />
      )}
    </>
  );
}
