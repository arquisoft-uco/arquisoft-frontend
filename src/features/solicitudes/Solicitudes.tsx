import { ClipboardList } from 'lucide-react';
import ComingSoon from '../../shared/components/ComingSoon';

export default function Solicitudes() {
  return (
    <ComingSoon
      title="Solicitudes"
      description="Gestión de trámites y solicitudes institucionales"
      icon={ClipboardList}
    />
  );
}
