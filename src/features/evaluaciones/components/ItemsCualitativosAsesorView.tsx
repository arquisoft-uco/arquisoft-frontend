import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import CriteriosItemCualitativoAsesorPanel from './CriteriosItemCualitativoAsesorPanel';
import ItemsCualitativosAsesorTable from './ItemsCualitativosAsesorTable';
import RegistrarItemCualitativoAsesorPanel from './RegistrarItemCualitativoAsesorPanel';

interface Props {
  puedeRegistrar?: boolean;
}

export default function ItemsCualitativosAsesorView({ puedeRegistrar = false }: Props) {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosAsesor();
  const [criteriosAbiertos, setCriteriosAbiertos] = useState(false);
  const [registrando, setRegistrando] = useState(false);

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
        {puedeRegistrar && (
          <Button icono={Plus} className="header-action" onClick={() => setRegistrando(true)}>
            Registrar ítem
          </Button>
        )}
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

      {registrando && (
        <RegistrarItemCualitativoAsesorPanel onCerrar={() => setRegistrando(false)} />
      )}

      {criteriosAbiertos && (
        <CriteriosItemCualitativoAsesorPanel onCerrar={() => setCriteriosAbiertos(false)} />
      )}
    </div>
  );
}
