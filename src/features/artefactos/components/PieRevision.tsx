import type { ReactNode } from 'react';
import Button from '../../../shared/components/ui/Button';

export const ID_NOTA_PIE_REVISION = 'nota-pie-revision';
export const ID_MOTIVO_SUBIDA_PIE = 'motivo-subida-pie-revision';

interface Props {
  nota?: string;
  motivoAccion?: string;
  onCerrar: () => void;
  conCerrar?: boolean;
  children?: ReactNode;
}

export default function PieRevision({
  nota,
  motivoAccion,
  onCerrar,
  conCerrar = true,
  children,
}: Props) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-surface p-4 sm:px-6">
      {nota && (
        <p id={ID_NOTA_PIE_REVISION} className="mb-3 text-sm text-on-surface-secondary">
          {nota}
        </p>
      )}
      {motivoAccion && (
        <p id={ID_MOTIVO_SUBIDA_PIE} className="mb-3 text-sm text-on-surface-secondary">
          {motivoAccion}
        </p>
      )}
      <div className="actions-row sm:flex-wrap">
        {conCerrar && (
          <Button variante="secundario" onClick={onCerrar}>
            Cerrar
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
