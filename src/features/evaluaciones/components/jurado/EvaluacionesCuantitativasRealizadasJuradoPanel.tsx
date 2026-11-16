import { useState } from 'react';
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
  onEvaluar?: () => void;
}

export default function EvaluacionesCuantitativasRealizadasJuradoPanel({
  evaluacionJuradoId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
  onEvaluar,
}: Props) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const idsTodas = (consulta.data ?? []).map((fila) => fila.id);
  const seleccionadas = marcados.filter((id) => idsTodas.includes(id));

  function alternar(id: string) {
    setMarcados((previos) =>
      previos.includes(id) ? previos.filter((previo) => previo !== id) : [...previos, id],
    );
  }

  if (finalizada) {
    return (
      <ConsultarEvaluacionesCuantitativasRealizadasJurado
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        evaluacionJuradoId={evaluacionJuradoId}
        evaluacionFinalizada
      />
    );
  }

  return (
    <div className={RAIZ}>
      {idsTodas.length > 0 && (
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
        onEvaluar={onEvaluar}
        evaluacionJuradoId={evaluacionJuradoId}
        seleccion={{ seleccionados: new Set(seleccionadas), onAlternar: alternar }}
      />
    </div>
  );
}
