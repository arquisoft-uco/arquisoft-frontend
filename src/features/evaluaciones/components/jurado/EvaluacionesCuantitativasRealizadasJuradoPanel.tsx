import { useEffect, useRef, useState } from 'react';
import { useEdicionPuntajeEnLineaJurado } from '../../hooks/useEdicionPuntajeEnLineaJurado';
import { enfocarElementoVisible } from '../../utils/enfocar-visible';
import ConsultarEvaluacionesCuantitativasRealizadasJurado from '../ConsultarEvaluacionesCuantitativasRealizadasJurado';
import type { ConsultaCuantitativas } from '../ConsultarEvaluacionesCuantitativasRealizadasJurado';
import OmitirEvaluacionesCuantitativasJuradoBarra from './OmitirEvaluacionesCuantitativasJuradoBarra';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  evaluacionJuradoId: string;
  consulta: ConsultaCuantitativas;
  finalizada: boolean;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function EvaluacionesCuantitativasRealizadasJuradoPanel({
  evaluacionJuradoId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
}: Props) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const raiz = useRef<HTMLDivElement>(null);
  const filaAnterior = useRef<string | null>(null);
  const edicionPuntaje = useEdicionPuntajeEnLineaJurado(evaluacionJuradoId);
  const idsTodas = (consulta.data ?? []).map((fila) => fila.id);
  const seleccionadas = marcados.filter((id) => idsTodas.includes(id));
  const filaEnEdicion = edicionPuntaje.edicion?.filaId ?? null;

  useEffect(() => {
    if (filaAnterior.current && !filaEnEdicion) {
      enfocarElementoVisible(raiz.current, `[data-accion-fila="${filaAnterior.current}"]`);
    }
    filaAnterior.current = filaEnEdicion;
  }, [filaEnEdicion]);

  function alternar(id: string) {
    setMarcados((previos) =>
      previos.includes(id) ? previos.filter((previo) => previo !== id) : [...previos, id],
    );
  }

  return (
    <div ref={raiz} className={RAIZ}>
      {!finalizada && idsTodas.length > 0 && (
        <OmitirEvaluacionesCuantitativasJuradoBarra
          evaluacionJuradoId={evaluacionJuradoId}
          idsTodas={idsTodas}
          seleccionadas={seleccionadas}
          onSeleccionarTodas={() => setMarcados(idsTodas)}
          onLimpiarSeleccion={() => setMarcados([])}
        />
      )}
      <ConsultarEvaluacionesCuantitativasRealizadasJurado
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        evaluacionFinalizada={finalizada}
        seleccion={
          finalizada ? undefined : { seleccionados: new Set(seleccionadas), onAlternar: alternar }
        }
        edicionPuntaje={finalizada ? undefined : edicionPuntaje}
      />
    </div>
  );
}
