import { ListChecks } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCategoriasItemCuantitativoAsesor } from '../../hooks/useCategoriasItemCuantitativoAsesor';
import { useItemsCuantitativosAsesor } from '../../hooks/useItemsCuantitativosAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import RegistrarEvaluacionesCuantitativasAsesorFormulario from './RegistrarEvaluacionesCuantitativasAsesorFormulario';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
  rutaListado: string;
}

export default function RegistrarEvaluacionesCuantitativasAsesorForm({
  asignacion,
  rutaListado,
}: Props) {
  const items = useItemsCuantitativosAsesor();
  const categorias = useCategoriasItemCuantitativoAsesor();

  if (items.isLoading || categorias.isLoading) {
    return <Skeleton variante="formulario" etiqueta="Cargando el formulario" />;
  }
  const fallida = items.isError ? items : categorias.isError ? categorias : null;
  if (fallida) {
    return (
      <ErrorState
        titulo="No se pudo cargar el formulario"
        descripcion={getApiErrorMessage(fallida.error, 'Inténtalo nuevamente.')}
        onReintentar={() => void fallida.refetch()}
      />
    );
  }
  if ((items.data ?? []).length === 0) {
    return (
      <EmptyState
        icono={ListChecks}
        titulo="Aún no hay ítems cuantitativos para valorar"
        descripcion="Cuando el administrador los registre, podrás asignarles un puntaje aquí."
      />
    );
  }

  return (
    <RegistrarEvaluacionesCuantitativasAsesorFormulario
      asignacion={asignacion}
      rutaListado={rutaListado}
      catalogoItems={items.data ?? []}
      categorias={categorias.data ?? []}
    />
  );
}
