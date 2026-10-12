import { useObservacionesMiFicha } from '../../hooks/useObservacionesMiFicha';
import ObservacionesFichaTabla from '../ObservacionesFichaTabla';

export default function ObservacionesMiFichaPanel() {
  const observaciones = useObservacionesMiFicha();

  return (
    <ObservacionesFichaTabla
      {...observaciones}
      tituloVacio="Tu ficha aún no tiene observaciones"
      descripcionVacia="Cuando tu asesor deje observaciones en una revisión, las verás aquí."
    />
  );
}
