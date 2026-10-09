import { useRevisionesFichaAsesor } from '../../hooks/useRevisionesFichaAsesor';
import RevisionesFichaTabla from '../RevisionesFichaTabla';

interface Props {
  fichaPerfilId: string;
}

export default function RevisionesFichaAsesorPanel({ fichaPerfilId }: Props) {
  const revisiones = useRevisionesFichaAsesor(fichaPerfilId);

  return (
    <RevisionesFichaTabla
      {...revisiones}
      tituloVacio="Esta ficha aún no tiene revisiones"
      descripcionVacia="Cuando revises un ítem de esta ficha, lo verás aquí."
    />
  );
}
