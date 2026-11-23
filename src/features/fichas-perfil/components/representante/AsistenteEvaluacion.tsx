import { useState } from 'react';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import AgregarEstadoEvaluacionPanel from './AgregarEstadoEvaluacionPanel';
import EvaluacionRegistradaTarjeta from './EvaluacionRegistradaTarjeta';
import PasoObservacionesEvaluacion from './PasoObservacionesEvaluacion';
import PasosEvaluacionIndicador from './PasosEvaluacionIndicador';

interface Props {
  evaluacion: EvaluacionFichaPerfil;
  fichaPerfilId: string;
  onVerObservaciones: () => void;
}

export default function AsistenteEvaluacion({
  evaluacion,
  fichaPerfilId,
  onVerObservaciones,
}: Props) {
  const [paso, setPaso] = useState<'observaciones' | 'estado'>('observaciones');
  const { observaciones, tieneDatos, isError, refetch } = useObservacionesEvaluacionRepresentante(
    fichaPerfilId,
    evaluacion.id,
  );

  let contenido;
  if (isError && !tieneDatos) {
    contenido = (
      <ErrorState
        titulo="No se pudieron cargar las observaciones"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  } else if (!tieneDatos) {
    contenido = <Skeleton variante="formulario" etiqueta="Cargando observaciones…" />;
  } else if (paso === 'observaciones') {
    contenido = (
      <PasoObservacionesEvaluacion
        evaluacion={evaluacion}
        fichaPerfilId={fichaPerfilId}
        observaciones={observaciones}
        onContinuar={() => setPaso('estado')}
      />
    );
  } else {
    contenido = (
      <AgregarEstadoEvaluacionPanel
        evaluacionId={evaluacion.id}
        fichaPerfilId={fichaPerfilId}
        cantidadObservaciones={observaciones.length}
        onVolver={() => setPaso('observaciones')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EvaluacionRegistradaTarjeta
        titulo="Evaluación en curso"
        evaluacion={evaluacion}
        onVerObservaciones={onVerObservaciones}
      />
      <PasosEvaluacionIndicador paso={paso} />
      {contenido}
    </div>
  );
}
