import { useCriteriosItemCualitativoJurado } from '../hooks/useCriteriosItemCualitativoJurado';
import CriteriosItemCualitativoPanel from './CriteriosItemCualitativoPanel';

interface Props {
  onCerrar: () => void;
}

export default function CriteriosItemCualitativoJuradoPanel({ onCerrar }: Props) {
  const { data: criterios = [], isLoading, error, refetch } = useCriteriosItemCualitativoJurado();

  return (
    <CriteriosItemCualitativoPanel
      criterios={criterios}
      cargando={isLoading}
      error={error}
      descripcion="Los criterios con los que se valoran los ítems cualitativos."
      onReintentar={() => void refetch()}
      onCerrar={onCerrar}
    />
  );
}
