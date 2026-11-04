import { useState } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import ConsultarEvaluacionesCualitativasJurado from '../ConsultarEvaluacionesCualitativasJurado';
import type { ConsultaCualitativas } from '../ConsultarEvaluacionesCualitativasJurado';
import OmitirEvaluacionesCualitativasJuradoBarra from './OmitirEvaluacionesCualitativasJuradoBarra';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  evaluacionJuradoId: string;
  consulta: ConsultaCualitativas;
  finalizada: boolean;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function EvaluacionesCualitativasRealizadasJuradoPanel({
  evaluacionJuradoId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
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
      <div className={RAIZ}>
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden omitir valoraciones.
        </Notice>
        <ConsultarEvaluacionesCualitativasJurado
          consulta={consulta}
          etiquetaVolver={etiquetaVolver}
          onVolver={onVolver}
        />
      </div>
    );
  }

  return (
    <div className={RAIZ}>
      {idsTodas.length > 0 && (
        <OmitirEvaluacionesCualitativasJuradoBarra
          evaluacionJuradoId={evaluacionJuradoId}
          idsTodas={idsTodas}
          seleccionadas={seleccionadas}
          onSeleccionarTodas={() => setMarcados(idsTodas)}
          onLimpiarSeleccion={() => setMarcados([])}
        />
      )}
      <ConsultarEvaluacionesCualitativasJurado
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        seleccion={{ seleccionados: new Set(seleccionadas), onAlternar: alternar }}
      />
    </div>
  );
}
