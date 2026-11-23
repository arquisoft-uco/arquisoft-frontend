import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import Notice from '../../../../shared/components/ui/Notice';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import { useEdicionCriterioEnLineaJurado } from '../../hooks/useEdicionCriterioEnLineaJurado';
import type { EvaluacionCualitativaJurado } from '../../models/EvaluacionCualitativaJurado';
import { enfocarElementoVisible } from '../../utils/enfocar-visible';
import ConsultarEvaluacionesCualitativasJurado from '../ConsultarEvaluacionesCualitativasJurado';
import type { ConsultaCualitativas } from '../ConsultarEvaluacionesCualitativasJurado';
import EditorCriterioEnLinea from '../EditorCriterioEnLinea';
import OmitirEvaluacionesCualitativasJuradoBarra from './OmitirEvaluacionesCualitativasJuradoBarra';

const RAIZ = 'flex flex-col gap-4';
const ACCIONES = 'flex shrink-0 items-center justify-end gap-1';

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
  const raiz = useRef<HTMLDivElement>(null);
  const filaAnterior = useRef<string | null>(null);
  const criterios = useCriteriosItemCualitativoJurado();
  const { edicion, iniciar, cambiar, cancelar, guardar, guardando } =
    useEdicionCriterioEnLineaJurado(evaluacionJuradoId);
  const idsTodas = (consulta.data ?? []).map((fila) => fila.id);
  const seleccionadas = marcados.filter((id) => idsTodas.includes(id));
  const filaEnEdicion = edicion?.filaId ?? null;

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

  const celdaCriterio = (fila: EvaluacionCualitativaJurado) =>
    edicion?.filaId === fila.id ? (
      <EditorCriterioEnLinea
        nombreItem={edicion.nombreItem}
        criterios={criterios.data ?? []}
        valor={edicion.valor}
        error={edicion.error}
        guardando={guardando}
        onCambiar={cambiar}
        onGuardar={guardar}
        onCancelar={cancelar}
      />
    ) : null;

  const acciones = (fila: EvaluacionCualitativaJurado) =>
    edicion?.filaId === fila.id ? null : (
      <div className={ACCIONES}>
        <IconButton
          etiqueta={`Cambiar criterio del ítem ${fila.item.nombre}`}
          icono={Pencil}
          rotulo="Cambiar criterio"
          data-accion-fila={fila.id}
          disabled={!criterios.data}
          onClick={() => iniciar(fila)}
        />
      </div>
    );

  return (
    <div ref={raiz} className={RAIZ}>
      {!finalizada && idsTodas.length > 0 && (
        <OmitirEvaluacionesCualitativasJuradoBarra
          evaluacionJuradoId={evaluacionJuradoId}
          idsTodas={idsTodas}
          seleccionadas={seleccionadas}
          onSeleccionarTodas={() => setMarcados(idsTodas)}
          onLimpiarSeleccion={() => setMarcados([])}
        />
      )}
      {!finalizada && criterios.isError && (
        <Notice
          variante="peligro"
          accion={{ etiqueta: 'Reintentar', onClick: () => void criterios.refetch() }}
        >
          No se pudieron cargar los criterios, por eso no puedes cambiarlos ahora.
        </Notice>
      )}
      <ConsultarEvaluacionesCualitativasJurado
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        seleccion={
          finalizada ? undefined : { seleccionados: new Set(seleccionadas), onAlternar: alternar }
        }
        acciones={finalizada ? undefined : acciones}
        celdaCriterio={finalizada ? undefined : celdaCriterio}
      />
    </div>
  );
}
