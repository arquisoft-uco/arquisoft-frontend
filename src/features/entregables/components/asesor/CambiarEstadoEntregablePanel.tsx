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
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import { useCambiarEstadoEntregable } from '../../hooks/useCambiarEstadoEntregable';
import { useEstadosEntregable } from '../../hooks/useEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import { ESTADO_CERRADO, ESTADOS_DESTINO, puedeCerrar } from '../../utils/estados-entregable';

const ID_FORMULARIO = 'cambiar-estado-entregable';
const NOMBRE_CAMPO = 'estado-destino';
const RESUMEN = 'mb-4 flex flex-col gap-1.5 rounded-xl bg-surface-secondary px-3.5 py-3';
const PROYECTO = 'text-sm font-semibold text-on-surface';
const DATOS = 'flex flex-wrap items-center gap-2 text-[13px] text-on-surface-secondary';
const OPCIONES = 'flex flex-col gap-2';
const MOTIVO_NO_CERRABLE =
  'Solo puedes cerrar un entregable Aprobado o Aprobado con observaciones.';

interface Props {
  entregable: EntregableProyectoGrado;
  onCerrar: () => void;
}

export default function CambiarEstadoEntregablePanel({ entregable, onCerrar }: Props) {
  const estados = useEstadosEntregable();
  const cambiar = useCambiarEstadoEntregable();
  const [destino, setDestino] = useState('');

  const opciones = (estados.data ?? []).filter((e) => ESTADOS_DESTINO.includes(e.id));
  const hayOpciones = !estados.isLoading && !estados.isError && opciones.length > 0;
  const conError = estados.isError || (!estados.isLoading && opciones.length === 0);
  const cerrable = puedeCerrar(entregable.estadoEntregable.id);

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!destino) return;
    const nombreDestino = opciones.find((o) => o.id === destino)?.nombre ?? '';
    cambiar.mutate(
      { entregableId: entregable.id, estadoEntregableId: destino },
      {
        onSuccess: () => {
          toast.success('Estado actualizado', `El entregable pasó a ${nombreDestino}.`);
          onCerrar();
        },
        onError: (err) =>
          toast.error(
            'No se pudo cambiar el estado',
            getApiErrorMessage(err, 'Inténtalo de nuevo.'),
          ),
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar estado del entregable"
      descripcion="Elige el nuevo estado del entregable. Solo puedes cancelarlo o cerrarlo."
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
        <span className={PROYECTO}>{entregable.proyectoGrado.nombre}</span>
        <div className={DATOS}>
          <span>Versión {entregable.versionEntregable}</span>
          <Badge variante={varianteEstadoEntregable(entregable.estadoEntregable.id)}>
            {entregable.estadoEntregable.nombre}
          </Badge>
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
              {opciones.map((estado) => {
                const bloqueada = estado.id === ESTADO_CERRADO && !cerrable;
                return (
                  <OpcionRadio
                    key={estado.id}
                    nombre={NOMBRE_CAMPO}
                    valor={estado.id}
                    titulo={estado.nombre}
                    descripcion={bloqueada ? MOTIVO_NO_CERRABLE : estado.descripcion}
                    elegida={destino === estado.id}
                    deshabilitada={bloqueada}
                    onElegir={setDestino}
                  />
                );
              })}
            </div>
          )}
        </FormSection>
        <Notice variante="advertencia">
          Este cambio no se puede deshacer: un entregable cancelado o cerrado no vuelve a estar
          disponible para evaluación.
        </Notice>
      </form>
    </SidePanel>
  );
}
