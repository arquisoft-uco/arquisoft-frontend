import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useAsesoresAsignadosProyectoGrado } from '../../hooks/useAsesoresAsignadosProyectoGrado';
import { obtenerAsesorActual } from '../../utils/asesor-actual';
import { AsesorProyectoIdentidad } from '../coordinador/AsesoresProyectoGradoCeldas';

interface Props {
  proyectoGradoId: string;
}

export default function AsesorActualResumen({ proyectoGradoId }: Props) {
  const { data, isLoading, isError } = useAsesoresAsignadosProyectoGrado(proyectoGradoId);

  if (isError) return <Notice variante="peligro">No pudimos cargar tu asesor.</Notice>;
  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando tu asesor…" />;
  }

  const asesor = obtenerAsesorActual(data);
  if (!asesor) return <p className="text-sm text-muted-foreground">Sin asesor asignado</p>;

  return <AsesorProyectoIdentidad asesor={asesor} />;
}
