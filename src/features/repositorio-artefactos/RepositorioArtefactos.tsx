import { CloudUpload } from 'lucide-react';
import ComingSoon from '../../shared/components/ComingSoon';

export default function RepositorioArtefactos() {
  return (
    <ComingSoon
      title="Repositorio de artefactos"
      description="Repositorio centralizado para todos los artefactos del proyecto"
      icon={CloudUpload}
    />
  );
}
