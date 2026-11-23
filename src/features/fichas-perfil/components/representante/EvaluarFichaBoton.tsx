import { ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import Button from '../../../../shared/components/ui/Button';

interface Props {
  fichaPerfilId: string;
}

export default function EvaluarFichaBoton({ fichaPerfilId }: Props) {
  const navigate = useNavigate();

  return (
    <Button
      icono={ClipboardCheck}
      onClick={() => navigate(`/fichas-perfil/${fichaPerfilId}/evaluaciones`)}
    >
      Evaluar ficha
    </Button>
  );
}
