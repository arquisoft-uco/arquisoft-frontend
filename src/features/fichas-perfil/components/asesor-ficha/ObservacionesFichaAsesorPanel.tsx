import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import ObservacionesFichaTabla from '../ObservacionesFichaTabla';

interface Props {
  fichaPerfilId: string;
}

export default function ObservacionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const observaciones = useObservacionesFichaAsesor(fichaPerfilId);

  return <ObservacionesFichaTabla {...observaciones} />;
}
