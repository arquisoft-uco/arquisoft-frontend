import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';
import AyudaTiposItem from '../AyudaTiposItem';
import ItemsFichaLista from '../ItemsFichaLista';

interface Props {
  fichaPerfilId: string;
}

export default function ItemsFichaAsesorPanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, refetch } = useItemsFichaAsesor(fichaPerfilId);

  return (
    <div className="flex flex-col items-start gap-3">
      <AyudaTiposItem />
      <div className="w-full">
        <ItemsFichaLista items={data} cargando={isLoading} error={isError} onReintentar={refetch} />
      </div>
    </div>
  );
}
