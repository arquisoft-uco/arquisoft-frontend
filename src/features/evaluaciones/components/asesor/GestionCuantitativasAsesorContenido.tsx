import { useId } from 'react';
import Notice from '../../../../shared/components/ui/Notice';
import { useEvaluacionesCuantitativasAsesor } from '../../hooks/useEvaluacionesCuantitativasAsesor';
import { useItemsCuantitativosPendientesAsesor } from '../../hooks/useItemsCuantitativosPendientesAsesor';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';
import { ESTADO_FINALIZADA } from '../../utils/estados-evaluacion';
import EvaluacionesCuantitativasRealizadasAsesorPanel from './EvaluacionesCuantitativasRealizadasAsesorPanel';
import ItemsPorEvaluarCuantitativosAsesorSeccion from './ItemsPorEvaluarCuantitativosAsesorSeccion';

const RAIZ = 'flex flex-col gap-6';
const SECCION = 'flex flex-col gap-4';
const TITULO = 'text-base font-semibold text-on-surface';

interface Props {
  asignacion: EvaluacionAsignadaAsesor;
  onVolver: () => void;
}

export default function GestionCuantitativasAsesorContenido({ asignacion, onVolver }: Props) {
  const idRealizadas = useId();
  const finalizada = asignacion.evaluacion.estado.id === ESTADO_FINALIZADA;
  const realizadas = useEvaluacionesCuantitativasAsesor(asignacion.id);
  const pendientes = useItemsCuantitativosPendientesAsesor(asignacion.id);
  const total = pendientes.filas.length;
  const faltan = pendientes.filas.filter((fila) => fila.pendiente).length;
  const listo = !pendientes.isLoading && !pendientes.isError && total > 0;

  return (
    <div className={RAIZ}>
      {finalizada && (
        <Notice variante="advertencia">
          La evaluación ya fue finalizada; no se pueden registrar, omitir ni cambiar valoraciones,
          ni registrar, modificar o remover observaciones.
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
        <EvaluacionesCuantitativasRealizadasAsesorPanel
          evaluacionAsesorId={asignacion.id}
          consulta={realizadas}
          finalizada={finalizada}
          etiquetaVolver="Volver a mis evaluaciones"
          onVolver={onVolver}
        />
      </section>
      <ItemsPorEvaluarCuantitativosAsesorSeccion
        evaluacionAsesorId={asignacion.id}
        proyecto={asignacion.entregable.proyecto}
        consulta={pendientes}
        finalizada={finalizada}
      />
    </div>
  );
}
