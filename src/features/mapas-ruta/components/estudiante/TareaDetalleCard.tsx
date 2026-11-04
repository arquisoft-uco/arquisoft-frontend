import Badge from '../../../../shared/components/ui/Badge';
import { varianteEstadoTarea } from '../../../../shared/utils/estado-variante';
import type { Tarea } from '../../models/Tarea';
import { formatearFechaCivil } from '../../utils/formato-fecha';

const DATO = 'flex flex-col gap-1';
const ETIQUETA = 'text-sm text-on-surface-secondary';
const VALOR = 'break-words text-base font-medium text-on-surface';
const SUBTEXTO = 'break-words text-[13px] font-normal text-on-surface-secondary';

interface Props {
  tarea: Tarea;
}

export default function TareaDetalleCard({ tarea }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <h2 className="break-words text-lg font-semibold text-on-surface">{tarea.descripcion}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className={DATO}>
          <dt className={ETIQUETA}>Estado</dt>
          <dd>
            <Badge variante={varianteEstadoTarea(tarea.estado.id)}>{tarea.estado.nombre}</Badge>
          </dd>
        </div>
        <div className={DATO}>
          <dt className={ETIQUETA}>Asesor</dt>
          <dd className={`${VALOR} flex flex-col`}>
            <span>{tarea.asesor.nombre}</span>
            <span className={SUBTEXTO}>{tarea.asesor.email}</span>
          </dd>
        </div>
        <div className={DATO}>
          <dt className={ETIQUETA}>Inicio del mapa de ruta</dt>
          <dd className={VALOR}>{formatearFechaCivil(tarea.fechaInicioMapaRuta)}</dd>
        </div>
        <div className={DATO}>
          <dt className={ETIQUETA}>Fin del mapa de ruta</dt>
          <dd className={VALOR}>{formatearFechaCivil(tarea.fechaFinMapaRuta)}</dd>
        </div>
      </dl>
    </section>
  );
}
