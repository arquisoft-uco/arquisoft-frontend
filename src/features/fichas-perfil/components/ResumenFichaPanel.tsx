import type { ReactNode } from 'react';
import Notice from '../../../shared/components/ui/Notice';
import type { ResumenFicha } from '../models/ResumenFicha';
import { DISPOSICION } from './disposicion';
import { AsesorDeFicha, InsigniaEstadoFicha } from './FichaCeldas';

const FILA = 'flex flex-col gap-1';
const ETIQUETA = 'text-[13px] font-medium text-on-surface-secondary';
const ACCIONES = 'flex flex-col items-start gap-2 border-t border-border pt-3';

interface Props {
  resumen: ResumenFicha | null;
  accion?: ReactNode;
  equipo?: ReactNode;
}

export default function ResumenFichaPanel({ resumen, accion, equipo }: Props) {
  const tieneEstado = Boolean(resumen?.estadoId && resumen.estadoNombre);
  const tieneAsesor = Boolean(resumen?.asesorNombre && resumen.asesorEmail);

  return (
    <aside className={DISPOSICION.tarjetaLateral} aria-label="Resumen de la ficha">
      <h2 className={DISPOSICION.tituloLateral}>Resumen</h2>
      {!resumen && (
        <Notice variante="info">
          No tenemos el resumen de esta ficha. Ábrela desde tu listado para verlo.
        </Notice>
      )}
      {resumen && tieneEstado && (
        <div className={FILA}>
          <span className={ETIQUETA}>Estado</span>
          <div>
            <InsigniaEstadoFicha
              estadoId={resumen.estadoId ?? ''}
              nombre={resumen.estadoNombre ?? ''}
            />
          </div>
        </div>
      )}
      {resumen && tieneAsesor && (
        <div className={FILA}>
          <span className={ETIQUETA}>Asesor</span>
          <AsesorDeFicha nombre={resumen.asesorNombre ?? ''} email={resumen.asesorEmail ?? ''} />
        </div>
      )}
      {equipo && (
        <div className={FILA}>
          <span className={ETIQUETA}>Equipo</span>
          {equipo}
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
