import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Pencil } from 'lucide-react';
import IconButton from '../../../../shared/components/ui/IconButton';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';
import { useEdicionPuntajeEnLineaAsesor } from '../../hooks/useEdicionPuntajeEnLineaAsesor';
import type { ObservacionItemAsesor } from '../../models/ObservacionItemAsesor';
import { enfocarElementoVisible } from '../../utils/enfocar-visible';
import EditorPuntajeEnLinea from '../EditorPuntajeEnLinea';
import ConsultarEvaluacionesCuantitativasAsesor from './ConsultarEvaluacionesCuantitativasAsesor';
import type { ConsultaCuantitativasAsesor } from './ConsultarEvaluacionesCuantitativasAsesor';
import ModificarObservacionItemAsesorPanel from './ModificarObservacionItemAsesorPanel';
import OmitirEvaluacionesCuantitativasAsesorBarra from './OmitirEvaluacionesCuantitativasAsesorBarra';
import RegistrarObservacionItemAsesorPanel from './RegistrarObservacionItemAsesorPanel';
import ObservacionesEvaluacionCuantitativaAsesorPanel from './ObservacionesEvaluacionCuantitativaAsesorPanel';

const RAIZ = 'flex flex-col gap-4';
const ACCIONES = 'flex shrink-0 items-center justify-end gap-1';

interface Props {
  evaluacionAsesorId: string;
  consulta: ConsultaCuantitativasAsesor;
  finalizada: boolean;
  etiquetaVolver: string;
  onVolver: () => void;
}

export default function EvaluacionesCuantitativasRealizadasAsesorPanel({
  evaluacionAsesorId,
  consulta,
  finalizada,
  etiquetaVolver,
  onVolver,
}: Props) {
  const [marcados, setMarcados] = useState<string[]>([]);
  const raiz = useRef<HTMLDivElement>(null);
  const filaAnterior = useRef<string | null>(null);
  const { edicion, iniciar, cambiar, cancelar, guardar, guardando } =
    useEdicionPuntajeEnLineaAsesor(evaluacionAsesorId);
  const [filaEnLectura, setFilaEnLectura] = useState<EvaluacionCuantitativaAsesor | null>(null);
  const [registrandoObservacion, setRegistrandoObservacion] = useState(false);
  const [observacionEnEdicion, setObservacionEnEdicion] = useState<ObservacionItemAsesor | null>(
    null,
  );

  const idsTodas = (consulta.data ?? []).map((fila) => fila.item.id);
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

  function cerrarObservaciones() {
    setFilaEnLectura(null);
    setRegistrandoObservacion(false);
    setObservacionEnEdicion(null);
  }

  const celdaPuntaje = (fila: EvaluacionCuantitativaAsesor) =>
    edicion?.filaId === fila.id ? (
      <EditorPuntajeEnLinea
        nombreItem={edicion.nombreItem}
        valorMaximo={edicion.valorMaximo}
        valor={edicion.valor}
        error={edicion.error}
        guardando={guardando}
        onCambiar={cambiar}
        onGuardar={guardar}
        onCancelar={cancelar}
      />
    ) : null;

  const acciones = (fila: EvaluacionCuantitativaAsesor) => (
    <div className={ACCIONES}>
      <IconButton
        etiqueta={`Ver observaciones de ${fila.item.nombre}`}
        icono={MessageSquare}
        rotulo="Ver observaciones"
        onClick={() => setFilaEnLectura(fila)}
      />
      {!finalizada && edicion?.filaId !== fila.id && (
        <IconButton
          etiqueta={`Cambiar puntaje del ítem ${fila.item.nombre}`}
          icono={Pencil}
          rotulo="Cambiar puntaje"
          data-accion-fila={fila.id}
          onClick={() => iniciar(fila)}
        />
      )}
    </div>
  );

  return (
    <div ref={raiz} className={RAIZ}>
      {!finalizada && idsTodas.length > 0 && (
        <OmitirEvaluacionesCuantitativasAsesorBarra
          evaluacionAsesorId={evaluacionAsesorId}
          idsTodas={idsTodas}
          seleccionadas={seleccionadas}
          onSeleccionarTodas={() => setMarcados(idsTodas)}
          onLimpiarSeleccion={() => setMarcados([])}
        />
      )}
      <ConsultarEvaluacionesCuantitativasAsesor
        consulta={consulta}
        etiquetaVolver={etiquetaVolver}
        onVolver={onVolver}
        seleccion={
          finalizada ? undefined : { seleccionados: new Set(seleccionadas), onAlternar: alternar }
        }
        acciones={acciones}
        celdaPuntaje={finalizada ? undefined : celdaPuntaje}
      />
      {filaEnLectura && (
        <ObservacionesEvaluacionCuantitativaAsesorPanel
          evaluacion={filaEnLectura}
          puedeRegistrar={!finalizada}
          onRegistrar={() => setRegistrandoObservacion(true)}
          puedeModificar={!finalizada}
          onModificar={setObservacionEnEdicion}
          puedeRemover={!finalizada}
          onCerrar={cerrarObservaciones}
        />
      )}
      {!finalizada && filaEnLectura && registrandoObservacion && (
        <RegistrarObservacionItemAsesorPanel
          evaluacion={filaEnLectura}
          onCerrar={() => setRegistrandoObservacion(false)}
        />
      )}
      {!finalizada && filaEnLectura && observacionEnEdicion && (
        <ModificarObservacionItemAsesorPanel
          observacion={observacionEnEdicion}
          nombreItem={filaEnLectura.item.nombre}
          onCerrar={() => setObservacionEnEdicion(null)}
        />
      )}
    </div>
  );
}
