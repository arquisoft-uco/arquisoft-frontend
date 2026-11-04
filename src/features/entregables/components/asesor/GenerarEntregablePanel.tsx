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
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useGenerarEntregable } from '../../hooks/useGenerarEntregable';
import { useProyectosAsesor } from '../../hooks/useProyectosAsesor';

const ID_FORMULARIO = 'generar-entregable';

interface Props {
  onCerrar: () => void;
}

export default function GenerarEntregablePanel({ onCerrar }: Props) {
  const proyectos = useProyectosAsesor();
  const generar = useGenerarEntregable();
  const [proyectoId, setProyectoId] = useState('');

  const lista = proyectos.data ?? [];
  const opciones = lista.map((p) => ({
    id: p.id,
    etiqueta: p.tituloProyecto,
    descripcion: p.estado.nombre,
  }));
  const sinProyectos = !proyectos.isLoading && !proyectos.isError && lista.length === 0;
  const hayCatalogo = !proyectos.isLoading && !proyectos.isError && lista.length > 0;

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!proyectoId) return;
    generar.mutate(proyectoId, {
      onSuccess: () => {
        toast.success('Entregable generado', 'Quedó disponible para evaluación.');
        onCerrar();
      },
      onError: (err) =>
        toast.error(
          'No se pudo generar el entregable',
          getApiErrorMessage(err, 'Inténtalo de nuevo.'),
        ),
    });
  }

  return (
    <SidePanel
      titulo="Generar entregable"
      descripcion="Crea la versión siguiente del entregable del proyecto que elijas. Quedará disponible para evaluación."
      sucio={!!proyectoId}
      ocupado={generar.isPending}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Generar entregable"
          accionEnviando="Generando…"
          enviando={generar.isPending}
          sucio={!!proyectoId}
          sinCambios={!proyectoId}
          nota={proyectoId ? undefined : 'Elige un proyecto'}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={enviar} noValidate>
        <FormSection titulo="Proyecto de grado">
          {proyectos.isLoading && <Skeleton variante="lineas" etiqueta="Cargando proyectos…" />}
          {proyectos.isError && (
            <ErrorState
              titulo="No pudimos cargar tus proyectos"
              descripcion="Inténtalo de nuevo en unos segundos."
              onReintentar={() => void proyectos.refetch()}
            />
          )}
          {sinProyectos && (
            <EmptyState
              icono={FolderOpen}
              titulo="Aún no tienes proyectos de grado"
              descripcion="Un entregable se genera sobre un proyecto de grado que tengas asignado."
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
      </form>
    </SidePanel>
  );
}
