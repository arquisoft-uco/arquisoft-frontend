import { Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import ListaEstudiantesArtefacto from './ListaEstudiantesArtefacto';

interface Props {
  artefactoId: string;
}

export default function EstudiantesArtefactoLista({ artefactoId }: Props) {
  const { data, isLoading, isError, error, refetch } = useEstudiantesArtefacto(artefactoId);

  if (isLoading) {
    return <Skeleton variante="lineas" etiqueta="Cargando los estudiantes del artefacto…" />;
  }
  if (isError || !data) {
    return (
      <ErrorState
        titulo="No pudimos cargar los estudiantes del artefacto"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={refetch}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icono={Users}
        titulo="Este artefacto no tiene estudiantes vinculados"
        descripcion="Cuando se vinculen estudiantes al artefacto, aparecerán aquí."
      />
    );
  }
  return <ListaEstudiantesArtefacto estudiantes={data} etiqueta="Estudiantes del artefacto" />;
}
