import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import { evaluacionEnEstadoFinal } from '../../utils/evaluacion-asistente';
import ListaObservacionesEvaluacion from '../ListaObservacionesEvaluacion';
import AgregarObservacionEvaluacionPanel from './AgregarObservacionEvaluacionPanel';
import EliminarObservacionEvaluacionDialogo from './EliminarObservacionEvaluacionDialogo';

type Respuesta = 'si' | 'no';

const TARJETA = 'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4';
const TITULO = 'text-sm font-semibold text-on-surface';

interface Props {
  evaluacion: EvaluacionFichaPerfil;
  fichaPerfilId: string;
  observaciones: ObservacionEvaluacion[];
  onContinuar: () => void;
}

export default function PasoObservacionesEvaluacion({
  evaluacion,
  fichaPerfilId,
  observaciones,
  onContinuar,
}: Props) {
  const [porEliminar, setPorEliminar] = useState<ObservacionEvaluacion | null>(null);
  const cantidad = observaciones.length;
  const [elegida, setElegida] = useState<Respuesta | null>(cantidad > 0 ? 'si' : null);
  const respuesta: Respuesta | null = cantidad > 0 ? 'si' : elegida;
  const puedeContinuar = respuesta === 'no' || (respuesta === 'si' && cantidad > 0);

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className={TARJETA}>
        <h4 className={TITULO}>¿Deseas agregar alguna observación?</h4>
        <OpcionRadio
          nombre="agregarObservacion"
          valor="si"
          titulo="Sí"
          descripcion="Deja por escrito lo que el estudiante debe ajustar o tener en cuenta."
          elegida={respuesta === 'si'}
          onElegir={() => setElegida('si')}
        />
        <OpcionRadio
          nombre="agregarObservacion"
          valor="no"
          titulo="No"
          descripcion={
            cantidad > 0
              ? 'Ya registraste observaciones, por eso no puedes elegir esta opción.'
              : 'Pasa directo a elegir el estado de la evaluación.'
          }
          elegida={respuesta === 'no'}
          deshabilitada={cantidad > 0}
          onElegir={() => setElegida('no')}
        />
      </div>

      {respuesta === 'si' && (
        <>
          <AgregarObservacionEvaluacionPanel
            evaluacionId={evaluacion.id}
            fichaPerfilId={fichaPerfilId}
          />
          {cantidad === 0 ? (
            <Notice variante="info">
              Agrega al menos una observación para continuar, o elige No.
            </Notice>
          ) : (
            <div className={TARJETA}>
              <h4 className={TITULO}>
                {cantidad === 1
                  ? '1 observación registrada'
                  : `${cantidad} observaciones registradas`}
              </h4>
              <ListaObservacionesEvaluacion
                observaciones={observaciones}
                onEliminar={evaluacionEnEstadoFinal(evaluacion) ? undefined : setPorEliminar}
              />
            </div>
          )}
        </>
      )}

      {porEliminar && (
        <EliminarObservacionEvaluacionDialogo
          observacion={porEliminar}
          fichaPerfilId={fichaPerfilId}
          evaluacionId={evaluacion.id}
          onCerrar={() => setPorEliminar(null)}
        />
      )}

      <div className="actions-row sm:justify-end">
        <Button icono={ArrowRight} disabled={!puedeContinuar} onClick={onContinuar}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
