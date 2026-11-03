import { useState } from 'react';
import { UserMinus, Users } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import RowMenu from '../../../../shared/components/ui/RowMenu';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import ListaEstudiantesArtefacto from './ListaEstudiantesArtefacto';
import RemoverEstudianteArtefactoDialog from './RemoverEstudianteArtefactoDialog';

interface Props {
  artefactoId: string;
  omitido?: boolean;
}

export default function EstudiantesArtefactoLista({ artefactoId, omitido = false }: Props) {
  const { data, isLoading, isError, error, refetch } = useEstudiantesArtefacto(artefactoId);
  const [estudianteAQuitar, setEstudianteAQuitar] = useState<EstudianteArtefacto | null>(null);

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
        acciones={
          omitido
            ? undefined
            : (estudiante) => (
                <RowMenu
                  etiqueta={`Acciones de ${estudiante.nombre}`}
                  acciones={[
                    {
                      etiqueta: 'Quitar estudiante',
                      icono: UserMinus,
                      peligro: true,
                      onSeleccionar: () => setEstudianteAQuitar(estudiante),
                    },
                  ]}
                />
              )
        }
      />
      {estudianteAQuitar && !omitido && (
        <RemoverEstudianteArtefactoDialog
          artefactoId={artefactoId}
          estudiante={estudianteAQuitar}
          onCerrar={() => setEstudianteAQuitar(null)}
        />
      )}
    </>
  );
}
