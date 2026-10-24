import { useNavigate } from 'react-router';
import { ClipboardCheck } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoFicha } from '../../../../shared/utils/estado-variante';
import { useFichasPorEvaluar } from '../../hooks/useFichasPorEvaluar';
import { formatearFecha } from '../../utils/formato-fecha';
import { LISTA } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

export default function BandejaFichasPanel() {
  const navigate = useNavigate();
  const { fichas, cargado, hayError, reintentar } = useFichasPorEvaluar();

  return (
    <SeccionInicio titulo="Fichas por evaluar">
      {hayError ? (
        <ErrorState
          titulo="No pudimos cargar las fichas por evaluar"
          onReintentar={() => void reintentar()}
        />
      ) : !cargado ? (
        <Skeleton variante="tarjetas" etiqueta="Cargando fichas por evaluar…" />
      ) : fichas.length === 0 ? (
        <EmptyState
          icono={ClipboardCheck}
          titulo="No hay fichas por evaluar"
          descripcion="Cuando una ficha esté disponible para evaluación aparecerá aquí."
          accion={
            <Button variante="secundario" onClick={() => navigate('/fichas-perfil')}>
              Ver todas las fichas
            </Button>
          }
        />
      ) : (
        <ul className={LISTA}>
          {fichas.map((ficha) => (
            <li key={ficha.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-medium text-on-surface">{ficha.titulo}</p>
                <p className="text-sm text-on-surface-secondary">
                  {ficha.asesorNombre} · {formatearFecha(ficha.fechaActualizacion)}
                </p>
                <div>
                  <Badge variante={varianteEstadoFicha(ficha.estadoId)}>{ficha.estadoNombre}</Badge>
                </div>
              </div>
              <Button
                variante="secundario"
                tamano="sm"
                onClick={() =>
                  navigate(`/fichas-perfil/${ficha.id}/items`, {
                    state: { resumen: ficha, search: '' },
                  })
                }
              >
                Revisar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SeccionInicio>
  );
}
