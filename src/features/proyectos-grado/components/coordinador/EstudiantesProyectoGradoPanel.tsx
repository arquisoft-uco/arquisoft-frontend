import { Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesProyectoGrado } from '../../hooks/useEstudiantesProyectoGrado';
import EstudiantesProyectoGradoLista from './EstudiantesProyectoGradoLista';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  onCerrar: () => void;
}

export default function EstudiantesProyectoGradoPanel({
  proyectoGradoId,
  titulo,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useEstudiantesProyectoGrado(proyectoGradoId);
  const estudiantes = data ?? [];

  function contenido() {
    if (isLoading) {
      return <Skeleton variante="lineas" etiqueta="Cargando estudiantes vinculados…" />;
    }
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los estudiantes"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={refetch}
        />
      );
    }
    if (estudiantes.length === 0) {
      return (
        <EmptyState
          icono={Users}
          titulo="Aún no hay estudiantes vinculados"
          descripcion="Este proyecto de grado todavía no tiene estudiantes vinculados."
        />
      );
    }
    return <EstudiantesProyectoGradoLista estudiantes={estudiantes} />;
  }

  return (
    <SidePanel
      titulo="Estudiantes del proyecto de grado"
      descripcion={titulo}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => <FormActions nota="Solo consulta." onCancelar={solicitarCierre} />}
    >
      {contenido()}
    </SidePanel>
  );
}
