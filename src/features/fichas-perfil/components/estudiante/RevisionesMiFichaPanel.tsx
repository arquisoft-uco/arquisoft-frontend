import { useRevisionesMiFicha } from '../../hooks/useRevisionesMiFicha';
import RevisionesFichaTabla from '../RevisionesFichaTabla';

export default function RevisionesMiFichaPanel() {
  const revisiones = useRevisionesMiFicha();

  return (
    <RevisionesFichaTabla
      {...revisiones}
      tituloVacio="Tu ficha aún no tiene revisiones"
      descripcionVacia="Cuando tu asesor revise un ítem y deje observaciones, lo verás aquí."
    />
  );
}
