import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCriteriosItemCualitativoAsesor } from '../../hooks/useCriteriosItemCualitativoAsesor';
import { useItemsCualitativosAsesor } from '../../hooks/useItemsCualitativosAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import RegistrarEvaluacionesCualitativasAsesorFormulario from './RegistrarEvaluacionesCualitativasAsesorFormulario';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
  rutaListado: string;
}

export default function RegistrarEvaluacionesCualitativasAsesorForm({
  asignacion,
  rutaListado,
}: Props) {
  const items = useItemsCualitativosAsesor();
  const criterios = useCriteriosItemCualitativoAsesor();

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
    <RegistrarEvaluacionesCualitativasAsesorFormulario
      asignacion={asignacion}
      rutaListado={rutaListado}
      catalogoItems={items.data ?? []}
      catalogoCriterios={criterios.data ?? []}
    />
  );
}
