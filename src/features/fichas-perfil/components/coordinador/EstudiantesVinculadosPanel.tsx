import { useState } from 'react';
import { Users } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstudiantesVinculados } from '../../hooks/useEstudiantesVinculados';
import { useRemoverEstudiante } from '../../hooks/useRemoverEstudiante';
import type { EstudianteVinculado } from '../../models/EstudianteVinculado';
import type { FichaPerfil } from '../../models/FichaPerfil';
import AsignarEstudianteForm from './AsignarEstudianteForm';
import EstudiantesVinculadosLista from './EstudiantesVinculadosLista';

const CONTENIDO = 'flex flex-col gap-6';

interface Props {
  ficha: FichaPerfil;
  onCerrar: () => void;
}

export default function EstudiantesVinculadosPanel({ ficha, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useEstudiantesVinculados(ficha.id);
  const { mutate: remover, isPending: quitando } = useRemoverEstudiante(ficha.id);
  const [pendiente, setPendiente] = useState<EstudianteVinculado | null>(null);

  const estudiantes = data ?? [];

  function confirmarQuitar() {
    if (!pendiente) return;
    const { id, nombre } = pendiente;
    remover(id, {
      onSuccess: () => {
        toast.success('Estudiante quitado', `${nombre} fue quitado de la ficha.`);
        setPendiente(null);
      },
      onError: (err) => {
        toast.error(
          'No se pudo quitar al estudiante',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        setPendiente(null);
      },
    });
  }

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

    return (
      <>
        {estudiantes.length === 0 ? (
          <EmptyState
            icono={Users}
            titulo="Aún no hay estudiantes vinculados"
            descripcion="Asigna estudiantes a esta ficha desde la lista de abajo."
          />
        ) : (
          <EstudiantesVinculadosLista
            estudiantes={estudiantes}
            quitando={quitando}
            onQuitar={setPendiente}
          />
        )}
        <FormSection titulo="Asignar estudiantes">
          <AsignarEstudianteForm idFichaPerfil={ficha.id} vinculados={estudiantes} />
        </FormSection>
      </>
    );
  }

  return (
    <SidePanel
      titulo="Estudiantes de la ficha"
      descripcion={ficha.tituloProyecto}
      onCerrar={onCerrar}
      ocupado={quitando}
      pie={(solicitarCierre) => (
        <FormActions nota="Los cambios se aplican al instante." onCancelar={solicitarCierre} />
      )}
    >
      <div className={CONTENIDO}>{contenido()}</div>
      {pendiente && (
        <ConfirmDialog
          titulo="¿Quitar estudiante?"
          descripcion={`${pendiente.nombre} será quitado de esta ficha de perfil.`}
          labelConfirmar="Quitar"
          variante="peligro"
          cargando={quitando}
          onConfirmar={confirmarQuitar}
          onCancelar={() => setPendiente(null)}
        />
      )}
    </SidePanel>
  );
}
