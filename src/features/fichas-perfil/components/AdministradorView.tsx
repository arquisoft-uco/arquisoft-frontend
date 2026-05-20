import { FileText } from 'lucide-react';
import ComingSoon from '../../../shared/components/ComingSoon';

export default function AdministradorView() {
  return (
    <ComingSoon
      title="Fichas de Perfil"
      description="Gestión administrativa de fichas de perfil."
      icon={FileText}
    />
  );
}
