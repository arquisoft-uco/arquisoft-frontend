import { useId } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import { useEvaluacionesCuantitativasRealizadasJurado } from '../../hooks/useEvaluacionesCuantitativasRealizadasJurado';
import { useItemsCuantitativosPendientesJurado } from '../../hooks/useItemsCuantitativosPendientesJurado';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import EvaluacionesCuantitativasRealizadasJuradoPanel from './EvaluacionesCuantitativasRealizadasJuradoPanel';
import ItemsPorEvaluarCuantitativosJuradoSeccion from './ItemsPorEvaluarCuantitativosJuradoSeccion';

const RAIZ = 'flex flex-col gap-6';
const SECCION = 'flex flex-col gap-4';
const TITULO = 'text-base font-semibold text-on-surface';

interface Props {
  asignacion: EvaluacionAsignadaJurado;
  onVolver: () => void;
}

export default function GestionCuantitativasJuradoContenido({ asignacion, onVolver }: Props) {
  const idRealizadas = useId();
  const finalizada = asignacion.evaluacion.estado.id === ESTADO_FINALIZADA;
  const realizadas = useEvaluacionesCuantitativasRealizadasJurado(asignacion.id);
  const pendientes = useItemsCuantitativosPendientesJurado(asignacion.id);
  const total = pendientes.filas.length;
  const faltan = pendientes.filas.filter((fila) => fila.pendiente).length;
  const listo = !pendientes.isLoading && !pendientes.isError && total > 0;

  return (
    <div className={RAIZ}>
      {finalizada && (
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden registrar, omitir ni cambiar valoraciones.
        </Notice>
      )}
      <div aria-live="polite" className="empty:hidden">
        {listo &&
          (faltan > 0 ? (
            <Notice variante="advertencia">
              Te faltan {faltan} de {total} ítems cuantitativos por evaluar.
            </Notice>
          ) : (
            <Notice variante="info">Evaluaste todos los ítems cuantitativos.</Notice>
          ))}
      </div>
      <section aria-labelledby={idRealizadas} className={SECCION}>
        <h2 id={idRealizadas} className={TITULO}>
          Evaluaciones realizadas
        </h2>
        <EvaluacionesCuantitativasRealizadasJuradoPanel
          evaluacionJuradoId={asignacion.id}
          consulta={realizadas}
          finalizada={finalizada}
          etiquetaVolver="Volver a mis evaluaciones"
          onVolver={onVolver}
        />
      </section>
      <ItemsPorEvaluarCuantitativosJuradoSeccion
        evaluacionJuradoId={asignacion.id}
        proyecto={asignacion.entregable.proyecto}
        consulta={pendientes}
        finalizada={finalizada}
      />
    </div>
  );
}
