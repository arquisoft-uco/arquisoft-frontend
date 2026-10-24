import { useItemsFichaCoordinador } from '../../hooks/useItemsFichaCoordinador';
import ItemsFichaLista from '../ItemsFichaLista';

interface Props {
  fichaPerfilId: string;
}

export default function ItemsFichaCoordinadorPanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, refetch } = useItemsFichaCoordinador(fichaPerfilId);

  return (
    <ItemsFichaLista items={data} cargando={isLoading} error={isError} onReintentar={refetch} />
  );
}
