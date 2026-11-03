import type { ReactNode } from 'react';
import Button from '../../../shared/components/ui/Button';

export const ID_NOTA_PIE_REVISION = 'nota-pie-revision';

interface Props {
  nota?: string;
  onCerrar: () => void;
  children?: ReactNode;
}

export default function PieRevision({ nota, onCerrar, children }: Props) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-surface p-4 sm:px-6">
      {nota && (
        <p id={ID_NOTA_PIE_REVISION} className="mb-3 text-sm text-on-surface-secondary">
          {nota}
        </p>
      )}
      <div className="actions-row">
        <Button variante="secundario" onClick={onCerrar}>
          Cerrar
        </Button>
        {children}
      </div>
    </div>
  );
}
