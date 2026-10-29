import type { MapaRuta } from '../../models/MapaRuta';
import { formatearFechaCivil } from '../../utils/formato-fecha';

interface Props {
  mapa: MapaRuta;
}

export default function MapaRutaEstudianteCard({ mapa }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold text-on-surface">{mapa.titulo}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-on-surface-secondary">Fecha de inicio</dt>
          <dd className="text-base font-medium text-on-surface">
            {formatearFechaCivil(mapa.fechaInicio)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-on-surface-secondary">Fecha de fin</dt>
          <dd className="text-base font-medium text-on-surface">
            {formatearFechaCivil(mapa.fechaFin)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
