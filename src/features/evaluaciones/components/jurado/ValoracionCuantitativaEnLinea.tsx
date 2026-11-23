import { useId, useState } from 'react';
import Button from '../../../../shared/components/ui/Button';
import type {
  ErroresValoracionBorrador,
  ValoracionBorrador,
} from '../../hooks/useBorradorEvaluacionesCuantitativasJurado';
import type { ItemCuantitativoJurado } from '../../models/ItemCuantitativoJurado';
import ValoracionPuntajeEnLinea from '../ValoracionPuntajeEnLinea';
import CampoObservacionEvaluacionCuantitativa from './CampoObservacionEvaluacionCuantitativa';

const RAIZ = 'flex min-w-0 flex-col items-start gap-2';

interface Props {
  item: ItemCuantitativoJurado;
  valor: ValoracionBorrador;
  errores?: ErroresValoracionBorrador;
  onCambiar: (campo: keyof ValoracionBorrador, texto: string) => void;
  onSalirDelCampo: () => void;
  deshabilitado?: boolean;
}

export default function ValoracionCuantitativaEnLinea({
  item,
  valor,
  errores,
  onCambiar,
  onSalirDelCampo,
  deshabilitado,
}: Props) {
  const id = useId();
  const [abierta, setAbierta] = useState(false);
  const idObservacion = `${id}-observacion`;
  const conObservacion = abierta || valor.observacion !== '';

  function alternarObservacion() {
    if (conObservacion) onCambiar('observacion', '');
    setAbierta(!conObservacion);
  }

  return (
    <div className={RAIZ}>
      <ValoracionPuntajeEnLinea
        item={item}
        puntaje={valor.puntaje}
        error={errores?.puntaje}
        onCambiar={(texto) => onCambiar('puntaje', texto)}
        onSalirDelCampo={onSalirDelCampo}
        deshabilitado={deshabilitado}
      />
      <Button
        variante="fantasma"
        tamano="sm"
        aria-expanded={conObservacion}
        aria-controls={conObservacion ? idObservacion : undefined}
        disabled={deshabilitado}
        onClick={alternarObservacion}
      >
        {conObservacion ? 'Quitar observación' : 'Agregar observación'}
      </Button>
      {conObservacion && (
        <div id={idObservacion} className="w-full">
          <CampoObservacionEvaluacionCuantitativa
            etiqueta={`Observación de ${item.nombre}`}
            valor={valor.observacion}
            onCambiar={(texto) => onCambiar('observacion', texto)}
            error={errores?.observacion}
            deshabilitado={deshabilitado}
          />
        </div>
      )}
    </div>
  );
}
