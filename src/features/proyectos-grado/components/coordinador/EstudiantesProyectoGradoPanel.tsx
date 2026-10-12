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
import { useAsignarEstudiantesProyectoGrado } from '../../hooks/useAsignarEstudiantesProyectoGrado';
import { useDestitucionEstudiante } from '../../hooks/useDestitucionEstudiante';
import { useEstudiantesProyectoGrado } from '../../hooks/useEstudiantesProyectoGrado';
import { mensajeErrorAsignacion } from '../../utils/errores-asignacion';
import AsignarEstudiantesProyectoGradoSeccion from './AsignarEstudiantesProyectoGradoSeccion';
import EstudiantesProyectoGradoLista from './EstudiantesProyectoGradoLista';

const ID_FORMULARIO = 'form-asignar-estudiantes-proyecto-grado';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  finalizado?: boolean;
  onCerrar: () => void;
}

export default function EstudiantesProyectoGradoPanel({
  proyectoGradoId,
  titulo,
  finalizado = false,
  onCerrar,
}: Props) {
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const { data, isLoading, isError, error, refetch } = useEstudiantesProyectoGrado(proyectoGradoId);
  const { mutate, isPending } = useAsignarEstudiantesProyectoGrado(proyectoGradoId);
  const { pendiente, destituyendo, solicitar, confirmar, cancelar } =
    useDestitucionEstudiante(proyectoGradoId);
  const estudiantes = data ?? [];
  const listaCargada = !isLoading && !isError;

  function enviar() {
    if (seleccion.length === 0) return;
    mutate(seleccion, {
      onSuccess: () => {
        toast.success(
          'Estudiantes asignados',
          'Los estudiantes se vincularon al proyecto de grado.',
        );
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo asignar a los estudiantes', mensajeErrorAsignacion(err));
      },
    });
  }

  function vinculados() {
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
    return (
      <EstudiantesProyectoGradoLista
        estudiantes={estudiantes}
        onDestituir={finalizado ? undefined : solicitar}
        destituyendo={destituyendo}
      />
    );
  }

  return (
    <SidePanel
      titulo="Estudiantes del proyecto de grado"
      descripcion={titulo}
      onCerrar={onCerrar}
      sucio={seleccion.length > 0}
      ocupado={isPending || destituyendo}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Asignar estudiantes"
          accionEnviando="Asignando…"
          formId={ID_FORMULARIO}
          sucio={seleccion.length > 0}
          sinCambios={seleccion.length === 0}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <div className="flex flex-col gap-6">
        <FormSection titulo="Estudiantes vinculados">{vinculados()}</FormSection>
        {listaCargada && (
          <AsignarEstudiantesProyectoGradoSeccion
            idFormulario={ID_FORMULARIO}
            vinculados={estudiantes}
            finalizado={finalizado}
            seleccion={seleccion}
            onCambiar={setSeleccion}
            onEnviar={enviar}
          />
        )}
      </div>
      {pendiente && (
        <ConfirmDialog
          titulo="Destituir estudiante"
          descripcion={`${pendiente.nombre} dejará de estar vinculado a este proyecto de grado.`}
          consecuencias={[
            'La vinculación se elimina y no se puede deshacer.',
            'Se libera un cupo: podrás asignar a otro estudiante.',
          ]}
          labelConfirmar="Destituir"
          variante="peligro"
          cargando={destituyendo}
          onConfirmar={confirmar}
          onCancelar={cancelar}
        />
      )}
    </SidePanel>
  );
}
