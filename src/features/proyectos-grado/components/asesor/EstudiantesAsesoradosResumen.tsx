import { Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesAsesoradosProyectoGrado } from '../../hooks/useEstudiantesAsesoradosProyectoGrado';
import ListaEstudiantesProyecto from '../ListaEstudiantesProyecto';

interface Props {
  proyectoGradoId: string;
}

export default function EstudiantesAsesoradosResumen({ proyectoGradoId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useEstudiantesAsesoradosProyectoGrado(proyectoGradoId);

  if (isLoading) {
    return <Skeleton variante="lineas" etiqueta="Cargando los estudiantes del proyecto…" />;
  }
  if (isError || !data) {
    return (
      <ErrorState
        titulo="No pudimos cargar los estudiantes"
        descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
        onReintentar={refetch}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EmptyState
        icono={Users}
        titulo="Este proyecto no tiene estudiantes vigentes"
        descripcion="Cuando el coordinador asigne estudiantes, aparecerán aquí."
      />
    );
  }
  return (
    <ListaEstudiantesProyecto
      estudiantes={data}
      etiqueta="Estudiantes del proyecto"
      conIdentificador
    />
  );
}
