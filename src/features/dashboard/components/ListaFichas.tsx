import { useNavigate } from 'react-router';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import { varianteEstadoFicha } from '../../../shared/utils/estado-variante';
import type { FichaResumen } from '../models/FichaResumen';
import { formatearFecha } from '../utils/formato-fecha';
import { LISTA } from './disposicion';

interface Props {
  fichas: readonly FichaResumen[];
  etiquetaAccion: string;
  mostrarAsesor?: boolean;
}

export default function ListaFichas({ fichas, etiquetaAccion, mostrarAsesor = true }: Props) {
  const navigate = useNavigate();

  return (
    <ul className={LISTA}>
      {fichas.map((ficha) => (
        <li key={ficha.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-medium text-on-surface">{ficha.titulo}</p>
            <p className="text-sm text-on-surface-secondary">
              {mostrarAsesor && `${ficha.asesorNombre} · `}
              {formatearFecha(ficha.fechaActualizacion)}
            </p>
            <div>
              <Badge variante={varianteEstadoFicha(ficha.estadoId)}>{ficha.estadoNombre}</Badge>
            </div>
          </div>
          <Button
            variante="secundario"
            tamano="sm"
            aria-label={`${etiquetaAccion} la ficha ${ficha.titulo}`}
            onClick={() =>
              navigate(`/fichas-perfil/${ficha.id}/items`, {
                state: { resumen: ficha, search: '' },
              })
            }
          >
            {etiquetaAccion}
          </Button>
        </li>
      ))}
    </ul>
  );
}
