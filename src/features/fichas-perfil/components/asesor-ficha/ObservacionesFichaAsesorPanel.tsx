import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import ObservacionesFichaTabla from '../ObservacionesFichaTabla';

interface Props {
  fichaPerfilId: string;
}

export default function ObservacionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const observaciones = useObservacionesFichaAsesor(fichaPerfilId);

  return (
    <ObservacionesFichaTabla
      {...observaciones}
      tituloVacio="Esta ficha aún no tiene observaciones"
      descripcionVacia="Cuando agregues una observación a una revisión, la verás aquí."
    />
  );
}
