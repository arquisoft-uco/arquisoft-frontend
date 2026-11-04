import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import { useItemsCualitativosJurado } from '../../hooks/useItemsCualitativosJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import RegistrarEvaluacionesCualitativasFormulario from './RegistrarEvaluacionesCualitativasFormulario';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
}

export default function RegistrarEvaluacionesCualitativasForm({ asignacion }: Props) {
  const items = useItemsCualitativosJurado();
  const criterios = useCriteriosItemCualitativoJurado();

  if (items.isLoading || criterios.isLoading) {
    return <Skeleton variante="formulario" etiqueta="Cargando el formulario" />;
  }
  const fallida = items.isError ? items : criterios.isError ? criterios : null;
  if (fallida) {
    return (
      <ErrorState
        titulo="No se pudo cargar el formulario"
        descripcion={getApiErrorMessage(fallida.error, 'Inténtalo nuevamente.')}
        onReintentar={() => void fallida.refetch()}
      />
    );
  }

  return (
    <RegistrarEvaluacionesCualitativasFormulario
      asignacion={asignacion}
      catalogoItems={items.data ?? []}
      catalogoCriterios={criterios.data ?? []}
    />
  );
}
