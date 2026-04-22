import { BookOpen } from 'lucide-react';
import ComingSoon from '../../shared/components/ComingSoon';

export default function Biblioteca() {
  return (
    <ComingSoon
      title="Biblioteca"
      description="Recursos, referencias y material académico de apoyo"
      icon={BookOpen}
    />
  );
}
