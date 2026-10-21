import { useNavigate } from 'react-router';
import { FileText } from 'lucide-react';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoFicha } from '../../../../shared/utils/estado-variante';
import { useFichaDelEstudiante } from '../../hooks/useFichaDelEstudiante';
import SeccionInicio from '../SeccionInicio';

export default function FichaEstudianteTarjeta() {
  const navigate = useNavigate();
  const { ficha, totalFichas, cargado, hayError, reintentar } = useFichaDelEstudiante();

  return (
    <SeccionInicio titulo="Tu ficha de perfil">
      {hayError ? (
        <ErrorState
          titulo="No pudimos cargar tu ficha"
          descripcion="Revisa tu conexión e inténtalo de nuevo."
          onReintentar={() => void reintentar()}
        />
      ) : !cargado ? (
        <Skeleton variante="tarjetas" etiqueta="Cargando tu ficha…" />
      ) : !ficha ? (
        <EmptyState
          icono={FileText}
          titulo="Aún no tienes una ficha de perfil"
          descripcion="Cuando tu coordinador te asigne a una, aparecerá aquí."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 text-lg font-semibold text-on-surface">{ficha.titulo}</p>
            <Badge variante={varianteEstadoFicha(ficha.estadoId)}>{ficha.estadoNombre}</Badge>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-on-surface-secondary">Asesor</dt>
              <dd className="font-medium text-on-surface">{ficha.asesorNombre}</dd>
            </div>
            <div>
              <dt className="text-on-surface-secondary">Equipo</dt>
              <dd className="font-medium text-on-surface">{ficha.integrantes.join(', ')}</dd>
            </div>
          </dl>
          {totalFichas > 1 && (
            <p className="text-sm text-on-surface-secondary">
              Tienes {totalFichas} fichas de perfil
            </p>
          )}
          <div>
            <Button onClick={() => navigate('/fichas-perfil')}>Abrir ficha</Button>
          </div>
        </div>
      )}
    </SeccionInicio>
  );
}
