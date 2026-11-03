import { useState, type FormEvent } from 'react';
import Badge from '../../../../shared/components/ui/Badge';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import OpcionRadio from '../../../../shared/components/ui/OpcionRadio';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { hasApiErrorCode } from '../../../../shared/utils/api-error';
import { varianteEstadoTarea } from '../../../../shared/utils/estado-variante';
import { useCambiarEstadoTarea } from '../../hooks/useCambiarEstadoTarea';
import { useEstadosTarea } from '../../hooks/useEstadosTarea';
import type { Tarea } from '../../models/Tarea';
import { mensajeErrorCambioEstadoTarea } from '../../utils/errores-mapa-ruta';
import { destinosDeEstado } from '../../utils/estados-tarea';

const ID_FORMULARIO = 'cambiar-estado-tarea';
const NOMBRE_CAMPO = 'estado-destino';
const RESUMEN = 'mb-4 flex flex-col gap-1.5 rounded-xl bg-surface-secondary px-3.5 py-3';
const DESCRIPCION = 'text-sm font-semibold text-on-surface';
const DATOS = 'flex flex-wrap items-center gap-2 text-[13px] text-on-surface-secondary';
const OPCIONES = 'flex flex-col gap-2';

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
}

export default function CambiarEstadoTareaPanel({ tarea, onCerrar }: Props) {
  const estados = useEstadosTarea();
  const cambiar = useCambiarEstadoTarea();
  const [destino, setDestino] = useState('');

  const permitidos = destinosDeEstado(tarea.estado.id);
  const opciones = (estados.data ?? []).filter((e) => permitidos.includes(e.id));
  const hayOpciones = !estados.isLoading && !estados.isError && opciones.length > 0;
  const conError = estados.isError || (!estados.isLoading && opciones.length === 0);

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!destino) return;
    const nombreDestino = opciones.find((o) => o.id === destino)?.nombre ?? '';
    cambiar.mutate(
      { tareaId: tarea.id, req: { estadoItemId: destino } },
      {
        onSuccess: () => {
          toast.success('Estado actualizado', `La tarea pasó a ${nombreDestino}.`);
          onCerrar();
        },
        onError: (err) => {
          toast.error('No se pudo cambiar el estado', mensajeErrorCambioEstadoTarea(err));
          if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) onCerrar();
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar estado de la tarea"
      descripcion="Elige el nuevo estado de la tarea."
      sucio={!!destino}
      ocupado={cambiar.isPending}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Cambiar estado"
          accionEnviando="Cambiando…"
          enviando={cambiar.isPending}
          sucio={!!destino}
          sinCambios={!destino}
          nota={destino ? undefined : 'Elige el nuevo estado'}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <div className={RESUMEN}>
        <span className={DESCRIPCION}>{tarea.descripcion}</span>
        <div className={DATOS}>
          <Badge variante={varianteEstadoTarea(tarea.estado.id)}>{tarea.estado.nombre}</Badge>
        </div>
      </div>

      <form id={ID_FORMULARIO} onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <FormSection titulo="Nuevo estado">
          {estados.isLoading && <Skeleton variante="lineas" etiqueta="Cargando estados…" />}
          {conError && (
            <ErrorState
              titulo="No pudimos cargar los estados"
              descripcion="Inténtalo de nuevo en unos segundos."
              onReintentar={() => void estados.refetch()}
            />
          )}
          {hayOpciones && (
            <div className={OPCIONES}>
              {opciones.map((estado) => (
                <OpcionRadio
                  key={estado.id}
                  nombre={NOMBRE_CAMPO}
                  valor={estado.id}
                  titulo={estado.nombre}
                  descripcion={estado.descripcion}
                  elegida={destino === estado.id}
                  onElegir={setDestino}
                />
              ))}
            </div>
          )}
        </FormSection>
        <Notice variante="advertencia">
          Este cambio no se puede deshacer: una tarea no vuelve a un estado anterior.
        </Notice>
      </form>
    </SidePanel>
  );
}
