import { Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesAsesoradosProyectoGrado } from '../../hooks/useEstudiantesAsesoradosProyectoGrado';
import { DISPOSICION } from '../disposicion';
import ListaEstudiantesProyecto from '../ListaEstudiantesProyecto';

interface Props {
  proyectoGradoId: string;
}

export default function EstudiantesAsesoradosPanel({ proyectoGradoId }: Props) {
  const { data, isLoading, isError, error, refetch } =
    useEstudiantesAsesoradosProyectoGrado(proyectoGradoId);

  function contenido() {
    if (isLoading) {
      return <Skeleton variante="lineas" etiqueta="Cargando los estudiantes que asesoras…" />;
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
        etiqueta="Estudiantes que asesoras"
        conIdentificador
      />
    );
  }

  return (
    <section className={DISPOSICION.tarjetaLateral} aria-labelledby="estudiantes-asesorados">
      <h2 id="estudiantes-asesorados" className="text-base font-semibold text-on-surface">
        Estudiantes que asesoras
      </h2>
      {contenido()}
    </section>
  );
}
