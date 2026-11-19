import { useNavigate } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import SeccionInicio from './SeccionInicio';

export interface Atajo {
  etiqueta: string;
  icono: LucideIcon;
  destino: string;
}

interface Props {
  atajos: readonly Atajo[];
}

export default function AtajosPanel({ atajos }: Props) {
  const navigate = useNavigate();

  return (
    <SeccionInicio titulo="Atajos">
      <div className="flex flex-wrap gap-2">
        {atajos.map(({ etiqueta, icono, destino }) => (
          <Button
            key={destino}
            variante="secundario"
            icono={icono}
            onClick={() => navigate(destino)}
          >
            {etiqueta}
          </Button>
        ))}
      </div>
    </SeccionInicio>
  );
}
