import { useState } from 'react';
import { UserCheck, UserPlus, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import { useEvaluacionesCoordinador } from '../../hooks/useEvaluacionesCoordinador';
import type { Evaluacion } from '../../models/Evaluacion';
import type { NavegacionJuradosEvaluacion } from '../../models/ResumenEvaluacion';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import ListadoEvaluaciones from '../ListadoEvaluaciones';
import AsignarAsesorEvaluacionPanel from './AsignarAsesorEvaluacionPanel';
import AsignarJuradosEvaluacionPanel from './AsignarJuradosEvaluacionPanel';

export default function ConsultarEvaluacionesCoordinador() {
  const listado = useEvaluacionesCoordinador();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [evaluacionAsignando, setEvaluacionAsignando] = useState<Evaluacion | null>(null);
  const [evaluacionAsesor, setEvaluacionAsesor] = useState<Evaluacion | null>(null);

  function verJurados(evaluacion: Evaluacion) {
    const state: NavegacionJuradosEvaluacion = {
      resumen: {
        id: evaluacion.id,
        proyecto: evaluacion.entregable.proyecto,
        version: evaluacion.entregable.version,
        finalizada: evaluacion.estado.id === ESTADO_FINALIZADA,
      },
      search,
    };
    navigate(`/evaluaciones/${evaluacion.id}/jurados`, { state });
  }

  return (
    <>
      <ListadoEvaluaciones
        listado={listado}
        encabezadoAcciones="Acciones"
        acciones={(evaluacion) => (
          <RowMenu
            etiqueta={`Acciones de ${evaluacion.entregable.proyecto}`}
            acciones={[
              {
                etiqueta: 'Ver jurados',
                icono: Users,
                onSeleccionar: () => verJurados(evaluacion),
              },
              {
                etiqueta: 'Asignar jurados',
                icono: UserPlus,
                deshabilitada: evaluacion.estado.id === ESTADO_FINALIZADA,
                onSeleccionar: () => setEvaluacionAsignando(evaluacion),
              },
              {
                etiqueta: 'Asignar asesor',
                icono: UserCheck,
                deshabilitada: evaluacion.estado.id === ESTADO_FINALIZADA,
                onSeleccionar: () => setEvaluacionAsesor(evaluacion),
              },
            ]}
          />
        )}
      />

      {evaluacionAsignando && (
        <AsignarJuradosEvaluacionPanel
          evaluacion={evaluacionAsignando}
          onCerrar={() => setEvaluacionAsignando(null)}
        />
      )}

      {evaluacionAsesor && (
        <AsignarAsesorEvaluacionPanel
          evaluacion={evaluacionAsesor}
          onCerrar={() => setEvaluacionAsesor(null)}
        />
      )}
    </>
  );
}
