import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useEvaluacionesFichaAsesor } from '../hooks/useEvaluacionesFichaAsesor';
import { fichaAdmiteEvaluacion } from '../utils/evaluacion-asistente';
import {
  bloqueoDeSalida,
  estadosDestino,
  type BloqueoSalidaFicha,
} from '../utils/transiciones-estado-ficha';
import CambiarEstadoFichaForm from './CambiarEstadoFichaForm';
import { InsigniaEstadoFicha } from './FichaCeldas';

function textoBloqueo({ motivo, cantidad }: BloqueoSalidaFicha): string {
  if (motivo === 'en-curso') {
    const evaluaciones =
      cantidad === 1 ? '1 evaluación en curso' : `${cantidad} evaluaciones en curso`;
    return `Esta ficha tiene ${evaluaciones}. No puedes devolverla a construcción ni descartarla mientras estén en curso.`;
  }
  const finalizadas =
    cantidad === 1 ? '1 evaluación ya finalizó' : `${cantidad} evaluaciones ya finalizaron`;
  return `Esta ficha espera la decisión del coordinador: ${finalizadas}. No puedes devolverla a construcción ni descartarla.`;
}

interface Props {
  fichaPerfilId: string;
  estadoActual: { id: string; nombre: string };
}

export default function EstadosFichaPanel({ fichaPerfilId, estadoActual }: Props) {
  const { data: estados = [], isLoading, isError } = useEstadosFicha();
  const fichaDisponible = fichaAdmiteEvaluacion(estadoActual.id);
  const consultaEvaluaciones = useEvaluacionesFichaAsesor(fichaPerfilId, fichaDisponible);
  const bloqueo = bloqueoDeSalida(estadoActual.id, consultaEvaluaciones.data ?? []);
  const opciones = estadosDestino(estadoActual.id, estados);

  function contenido() {
    if (isLoading) return <Skeleton variante="formulario" etiqueta="Cargando estados…" />;
    if (isError) {
      return <Notice variante="peligro">No se pudieron cargar los estados disponibles.</Notice>;
    }
    if (opciones.length === 0) {
      return (
        <Notice variante="info">Esta ficha está en un estado final; no admite cambios.</Notice>
      );
    }
    if (fichaDisponible && consultaEvaluaciones.isLoading) {
      return <Skeleton variante="formulario" etiqueta="Revisando las evaluaciones…" />;
    }
    if (bloqueo) return <Notice variante="info">{textoBloqueo(bloqueo)}</Notice>;
    return (
      <CambiarEstadoFichaForm
        fichaPerfilId={fichaPerfilId}
        opciones={opciones}
        evaluacionesSinRevisar={fichaDisponible && consultaEvaluaciones.isError}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-on-surface-secondary">Estado actual:</span>
        <InsigniaEstadoFicha estadoId={estadoActual.id} nombre={estadoActual.nombre} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-on-surface">Cambiar estado</h3>
        {contenido()}
      </div>
    </div>
  );
}
