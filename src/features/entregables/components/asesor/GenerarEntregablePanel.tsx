import { useState, type FormEvent } from 'react';
import { FolderOpen } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Field from '../../../../shared/components/ui/Field';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Combobox from '../../../../shared/components/ui/Combobox';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { useGenerarEntregable } from '../../hooks/useGenerarEntregable';
import { useProyectosGenerables } from '../../hooks/useProyectosGenerables';
import { useVistaPreviaPaquete } from '../../hooks/useVistaPreviaPaquete';
import {
  MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE,
  mensajeErrorGenerarEntregable,
} from '../../utils/errores-entregable';
import VistaPreviaPaqueteSeccion from './VistaPreviaPaqueteSeccion';

const ID_FORMULARIO = 'generar-entregable';

interface Props {
  onCerrar: () => void;
}

export default function GenerarEntregablePanel({ onCerrar }: Props) {
  const generables = useProyectosGenerables();
  const generar = useGenerarEntregable();
  const [elegido, setProyectoId] = useState('');
  const proyectoId = generables.proyectos.some((p) => p.id === elegido) ? elegido : '';
  const vistaPrevia = useVistaPreviaPaquete(proyectoId);

  const opciones = generables.proyectos.map((p) => ({
    id: p.id,
    etiqueta: p.tituloProyecto,
    descripcion: p.estado.nombre,
  }));
  const cargado = !generables.isLoading && !generables.isError;
  const sinProyectos = cargado && generables.totalEnCurso === 0;
  const todosConEntregable = cargado && generables.totalEnCurso > 0 && opciones.length === 0;
  const hayCatalogo = cargado && opciones.length > 0;
  const puedeGenerar =
    !!proyectoId &&
    vistaPrevia.isSuccess &&
    !vistaPrevia.isFetching &&
    vistaPrevia.data.cantidad > 0;

  function motivo(): string | undefined {
    if (puedeGenerar) return undefined;
    if (!proyectoId) return 'Elige un proyecto';
    if (vistaPrevia.isLoading || vistaPrevia.isFetching) return 'Cargando la vista previa…';
    if (vistaPrevia.isError) return 'No pudimos cargar la vista previa';
    return MOTIVO_SIN_ARTEFACTOS_PARA_PAQUETE;
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!puedeGenerar) return;
    generar.mutate(proyectoId, {
      onSuccess: () => {
        toast.success(
          'Entregable generado',
          'Quedó en estado Nuevo. Revísalo y habilítalo para evaluación.',
        );
        onCerrar();
      },
      onError: (err) =>
        toast.error('No se pudo generar el entregable', mensajeErrorGenerarEntregable(err)),
    });
  }

  return (
    <SidePanel
      titulo="Generar entregable"
      descripcion="Crea el entregable con la última versión cerrada de cada artefacto del proyecto que elijas. Quedará en estado Nuevo hasta que lo habilites para evaluación."
      sucio={!!proyectoId}
      ocupado={generar.isPending}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Generar entregable"
          accionEnviando="Generando paquete…"
          enviando={generar.isPending}
          sucio={!!proyectoId}
          sinCambios={!puedeGenerar}
          nota={motivo()}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={enviar} noValidate>
        <FormSection titulo="Proyecto de grado">
          {generables.isLoading && <Skeleton variante="lineas" etiqueta="Cargando proyectos…" />}
          {generables.isError && (
            <ErrorState
              titulo="No pudimos cargar tus proyectos"
              descripcion="Inténtalo de nuevo en unos segundos."
              onReintentar={generables.refetch}
            />
          )}
          {sinProyectos && (
            <EmptyState
              icono={FolderOpen}
              titulo="Aún no tienes proyectos en curso"
              descripcion="Un entregable se genera sobre un proyecto de grado en proceso o atrasado que tengas asignado."
            />
          )}
          {todosConEntregable && (
            <EmptyState
              icono={FolderOpen}
              titulo="Tus proyectos en curso ya tienen un entregable vigente"
              descripcion="Para generar uno nuevo, cancela el actual desde la lista de entregables."
            />
          )}
          {hayCatalogo && (
            <Field etiqueta="Proyecto">
              {(campo) => (
                <Combobox
                  {...campo}
                  valor={proyectoId}
                  onCambiar={setProyectoId}
                  opciones={opciones}
                  etiquetaElegidos="Proyecto elegido"
                  textoVacio="No hay proyectos que coincidan."
                  placeholder="Busca por título"
                />
              )}
            </Field>
          )}
        </FormSection>
        {proyectoId && (
          <div className="mt-4">
            <VistaPreviaPaqueteSeccion vistaPrevia={vistaPrevia} />
          </div>
        )}
      </form>
    </SidePanel>
  );
}
