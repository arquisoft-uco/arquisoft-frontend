import { useState } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import ConsultarEvaluacionesCualitativasAsesor from './ConsultarEvaluacionesCualitativasAsesor';
import type { ConsultaCualitativasAsesor } from './ConsultarEvaluacionesCualitativasAsesor';
import OmitirEvaluacionesCualitativasAsesorBarra from './OmitirEvaluacionesCualitativasAsesorBarra';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  evaluacionAsesorId: string;
  consulta: ConsultaCualitativasAsesor;
  finalizada: boolean;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function EvaluacionesCualitativasRealizadasAsesorPanel({
  evaluacionAsesorId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
}: Props) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const idsTodas = (consulta.data ?? []).map((fila) => fila.item.id);
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
        <ConsultarEvaluacionesCualitativasAsesor
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
        <OmitirEvaluacionesCualitativasAsesorBarra
          evaluacionAsesorId={evaluacionAsesorId}
          idsTodas={idsTodas}
          seleccionadas={seleccionadas}
          onSeleccionarTodas={() => setMarcados(idsTodas)}
          onLimpiarSeleccion={() => setMarcados([])}
        />
      )}
      <ConsultarEvaluacionesCualitativasAsesor
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        seleccion={{ seleccionados: new Set(seleccionadas), onAlternar: alternar }}
      />
    </div>
  );
}
