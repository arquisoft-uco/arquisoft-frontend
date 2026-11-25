import { Ban } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import { useEvaluacionDescartada } from '../../hooks/useEvaluacionDescartada';
import { useItemsFichaRepresentante } from '../../hooks/useItemsFichaRepresentante';
import AyudaTiposItem from '../AyudaTiposItem';
import ItemsFichaLista from '../ItemsFichaLista';

interface Props {
  fichaPerfilId: string;
}

export default function ItemsFichaRepresentantePanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, refetch } = useItemsFichaRepresentante(fichaPerfilId);
  const { descartada, cargando } = useEvaluacionDescartada(fichaPerfilId);

  return (
    <div className="flex flex-col items-start gap-3">
      <AyudaTiposItem />
      <div className="w-full">
        <ItemsFichaLista
          items={data}
          cargando={isLoading || (cargando && data?.length === 0)}
          error={isError}
          onReintentar={refetch}
          vacio={
            descartada ? (
              <EmptyState
                icono={Ban}
                titulo="Tu evaluación está descartada"
                descripcion="Reanúdala desde el apartado Resumen para ver los ítems de la ficha."
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
