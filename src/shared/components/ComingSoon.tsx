import { useNavigate } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { Hammer } from 'lucide-react';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import PageHeader from './ui/PageHeader';

interface Props {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function ComingSoon({ title, description, icon = Hammer }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader titulo={title} descripcion={description} />
      <EmptyState
        icono={icon}
        titulo="Esta opción aún no está disponible."
        descripcion="Cuando esté lista, la encontrarás en el menú."
        accion={
          <Button variante="secundario" onClick={() => navigate('/dashboard')}>
            Volver al inicio
          </Button>
        }
      />
    </div>
  );
}
