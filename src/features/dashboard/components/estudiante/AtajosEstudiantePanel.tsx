import { useNavigate } from 'react-router';
import { Send } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import SeccionInicio from '../SeccionInicio';

export default function AtajosEstudiantePanel() {
  const navigate = useNavigate();

  return (
    <SeccionInicio titulo="Atajos">
      <Button variante="secundario" icono={Send} onClick={() => navigate('/solicitudes')}>
        Enviar una solicitud
      </Button>
    </SeccionInicio>
  );
}
