import { useCriteriosItemCualitativoAsesor } from '../hooks/useCriteriosItemCualitativoAsesor';
import CriteriosItemCualitativoPanel from './CriteriosItemCualitativoPanel';

interface Props {
  onCerrar: () => void;
}

export default function CriteriosItemCualitativoAsesorPanel({ onCerrar }: Props) {
  const { data: criterios = [], isLoading, error, refetch } = useCriteriosItemCualitativoAsesor();

  return (
    <CriteriosItemCualitativoPanel
      criterios={criterios}
      cargando={isLoading}
      error={error}
      descripcion="Los criterios con los que se evalúan los ítems cualitativos."
      onReintentar={() => void refetch()}
      onCerrar={onCerrar}
    />
  );
}
