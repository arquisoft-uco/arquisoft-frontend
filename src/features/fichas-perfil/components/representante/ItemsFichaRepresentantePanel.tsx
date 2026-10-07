import { useItemsFichaRepresentante } from '../../hooks/useItemsFichaRepresentante';
import AyudaTiposItem from '../AyudaTiposItem';
import ItemsFichaLista from '../ItemsFichaLista';

interface Props {
  fichaPerfilId: string;
}

export default function ItemsFichaRepresentantePanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, refetch } = useItemsFichaRepresentante(fichaPerfilId);

  return (
    <div className="flex flex-col items-start gap-3">
      <AyudaTiposItem />
      <div className="w-full">
        <ItemsFichaLista items={data} cargando={isLoading} error={isError} onReintentar={refetch} />
      </div>
    </div>
  );
}
