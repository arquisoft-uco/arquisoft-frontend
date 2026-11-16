import { useState } from 'react';
import { ListChecks } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import CriteriosItemCualitativoAsesorPanel from './CriteriosItemCualitativoAsesorPanel';
import ItemsCualitativosAsesorTable from './ItemsCualitativosAsesorTable';

export default function ItemsCualitativosAsesorView() {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosAsesor();
  const [criteriosAbiertos, setCriteriosAbiertos] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-header">
        <p className="text-sm text-on-surface-secondary">
          Ítems con los que el asesor evalúa cada proyecto.
        </p>
        <Button
          variante="fantasma"
          tamano="sm"
          icono={ListChecks}
          className="header-action"
          aria-haspopup="dialog"
          onClick={() => setCriteriosAbiertos(true)}
        >
          Ver criterios
        </Button>
      </div>

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del asesor" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del asesor."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && <ItemsCualitativosAsesorTable items={data} />}

      {criteriosAbiertos && (
        <CriteriosItemCualitativoAsesorPanel onCerrar={() => setCriteriosAbiertos(false)} />
      )}
    </div>
  );
}
