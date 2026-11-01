import { useState } from 'react';
import { UserMinus, Users } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import { useRemoverEstudianteArtefacto } from '../../hooks/useRemoverEstudianteArtefacto';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import ListaEstudiantesArtefacto from './ListaEstudiantesArtefacto';

interface Props {
  artefactoId: string;
}

export default function EstudiantesArtefactoLista({ artefactoId }: Props) {
  const { data, isLoading, isError, error, refetch } = useEstudiantesArtefacto(artefactoId);
  const quitar = useRemoverEstudianteArtefacto();
  const [estudianteAQuitar, setEstudianteAQuitar] = useState<EstudianteArtefacto | null>(null);

  function confirmarQuitar() {
    if (!estudianteAQuitar) return;
    quitar.mutate(
      { artefactoId, estudianteId: estudianteAQuitar.estudianteId },
      {
        onSuccess: () => {
          toast.success('Estudiante quitado', `${estudianteAQuitar.nombre} ya no está vinculado.`);
          setEstudianteAQuitar(null);
        },
        onError: (err) => {
          toast.error(
            'No se pudo quitar al estudiante',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          setEstudianteAQuitar(null);
        },
      },
    );
  }

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
  return (
    <>
      <ListaEstudiantesArtefacto
        estudiantes={data}
        etiqueta="Estudiantes del artefacto"
        acciones={(estudiante) => (
          <RowMenu
            etiqueta={`Acciones de ${estudiante.nombre}`}
            acciones={[
              {
                etiqueta: 'Quitar estudiante',
                icono: UserMinus,
                peligro: true,
                deshabilitada:
                  quitar.isPending && quitar.variables?.estudianteId === estudiante.estudianteId,
                onSeleccionar: () => setEstudianteAQuitar(estudiante),
              },
            ]}
          />
        )}
      />
      {estudianteAQuitar && (
        <ConfirmDialog
          titulo={`¿Quitar a ${estudianteAQuitar.nombre} del artefacto?`}
          descripcion="El estudiante dejará de estar vinculado a este artefacto."
          consecuencias={[
            'Dejará de ver y entregar este artefacto.',
            'Se le enviará un aviso por correo.',
          ]}
          labelConfirmar="Quitar estudiante"
          variante="peligro"
          cargando={quitar.isPending}
          onConfirmar={confirmarQuitar}
          onCancelar={() => setEstudianteAQuitar(null)}
        />
      )}
    </>
  );
}
