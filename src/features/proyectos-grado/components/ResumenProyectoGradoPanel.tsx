import type { ReactNode } from 'react';
import Notice from '../../../shared/components/ui/Notice';
import type { ResumenProyectoGrado } from '../models/ResumenProyectoGrado';
import { InsigniaEstadoProyecto } from './coordinador/ProyectoGradoCeldas';
import { DISPOSICION } from './disposicion';

const FILA = 'flex flex-col gap-1';
const ETIQUETA = 'text-[13px] font-medium text-on-surface-secondary';
const ACCIONES = 'flex flex-col items-start gap-2 border-t border-border pt-3';

interface Props {
  resumen: ResumenProyectoGrado | null;
  accion?: ReactNode;
}

export default function ResumenProyectoGradoPanel({ resumen, accion }: Props) {
  const tieneEstado = Boolean(resumen?.estadoId && resumen.estadoNombre);

  return (
    <aside className={DISPOSICION.tarjetaLateral} aria-label="Resumen del proyecto de grado">
      <h2 className={DISPOSICION.tituloLateral}>Resumen</h2>
      {!resumen && (
        <Notice variante="info">
          No tenemos el resumen de este proyecto. Ábrelo desde tu listado para verlo.
        </Notice>
      )}
      {resumen && tieneEstado && (
        <div className={FILA}>
          <span className={ETIQUETA}>Estado</span>
          <div>
            <InsigniaEstadoProyecto
              estadoId={resumen.estadoId ?? ''}
              nombre={resumen.estadoNombre ?? ''}
            />
          </div>
        </div>
      )}
      {accion && (
        <div className={ACCIONES}>
          <h3 className={ETIQUETA}>Acciones</h3>
          {accion}
        </div>
      )}
    </aside>
  );
}
