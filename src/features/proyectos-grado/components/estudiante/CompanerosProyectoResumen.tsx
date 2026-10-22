import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useCompanerosProyectoGrado } from '../../hooks/useCompanerosProyectoGrado';
import ListaEstudiantesProyecto from '../ListaEstudiantesProyecto';

interface Props {
  proyectoGradoId: string;
}

export default function CompanerosProyectoResumen({ proyectoGradoId }: Props) {
  const { data, isLoading, isError } = useCompanerosProyectoGrado(proyectoGradoId);

  if (isError) {
    return <Notice variante="peligro">No pudimos cargar los estudiantes del proyecto.</Notice>;
  }
  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando los estudiantes del proyecto…" />;
  }

  return <ListaEstudiantesProyecto estudiantes={data} etiqueta="Estudiantes del proyecto" />;
}
