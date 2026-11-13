import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import type { ObservacionPendienteEvaluacionCuantitativa } from '../../models/ObservacionPendienteEvaluacionCuantitativa';

const LISTA = 'flex flex-col gap-3';
const FILA = 'rounded-xl border border-border p-3 text-sm';
const NOMBRE = 'font-semibold text-on-surface';
const TEXTO = 'mt-1 break-words text-on-surface-secondary';
const MOTIVO = 'mt-1 text-danger-muted-foreground';

interface Props {
  pendientes: ObservacionPendienteEvaluacionCuantitativa[];
  nombresPorId: ReadonlyMap<string, string>;
  reintentando: boolean;
  onReintentar: () => void;
  onSalir: () => void;
}

export default function ObservacionesPendientesAviso({
  pendientes,
  nombresPorId,
  reintentando,
  onReintentar,
  onSalir,
}: Props) {
  const [saliendo, setSaliendo] = useState(false);
  const total = pendientes.length;
  return (
    <>
      <Notice variante="advertencia" titulo="Evaluación registrada. Faltan observaciones">
        Se guardaron los puntajes, pero {total} {total === 1 ? 'observación' : 'observaciones'} no
        se {total === 1 ? 'pudo' : 'pudieron'} guardar. Puedes reintentar o salir sin ellas; no hay
        otra forma de agregarlas después.
      </Notice>
      <ul className={LISTA} aria-label="Observaciones pendientes">
        {pendientes.map(({ itemId, descripcion, motivo }) => (
          <li key={itemId} className={FILA}>
            <p className={NOMBRE}>{nombresPorId.get(itemId) ?? itemId}</p>
            <p className={TEXTO}>{descripcion}</p>
            <p className={MOTIVO}>{motivo}</p>
          </li>
        ))}
      </ul>
      <div className="actions-row">
        <Button variante="primario" cargando={reintentando} onClick={onReintentar}>
          Reintentar observaciones
        </Button>
        <Button variante="secundario" disabled={reintentando} onClick={() => setSaliendo(true)}>
          Salir sin ellas
        </Button>
      </div>
      {saliendo && (
        <ConfirmDialog
          titulo="¿Salir sin las observaciones?"
          descripcion="Se perderán las observaciones que no se guardaron. Los puntajes ya están registrados."
          variante="advertencia"
          labelConfirmar="Salir sin ellas"
          labelCancelar="Volver"
          onConfirmar={onSalir}
          onCancelar={() => setSaliendo(false)}
        />
      )}
    </>
  );
}
