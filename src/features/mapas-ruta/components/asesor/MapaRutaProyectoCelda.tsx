import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useMapaRutaProyectoAsesor } from '../../hooks/useMapaRutaProyectoAsesor';
import { formatearFechaCivil } from '../../utils/formato-fecha';

const FECHAS = 'text-sm text-on-surface-secondary';
const ERROR = 'flex flex-wrap items-center gap-2 text-sm text-on-surface-secondary';

interface Props {
  proyectoGradoId: string;
}

export default function MapaRutaProyectoCelda({ proyectoGradoId }: Props) {
  const { mapa, cargando, sinMapa, hayError, reintentar } =
    useMapaRutaProyectoAsesor(proyectoGradoId);

  if (cargando) return <Skeleton variante="lineas" etiqueta="Cargando el mapa de ruta" />;

  if (sinMapa) return <Badge variante="neutro">Sin mapa de ruta</Badge>;

  if (hayError || !mapa) {
    return (
      <div className={ERROR}>
        <span>No se pudo cargar</span>
        <Button variante="secundario" tamano="sm" onClick={() => reintentar()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <p className={FECHAS}>
      Inicio {formatearFechaCivil(mapa.fechaInicio)} · Fin {formatearFechaCivil(mapa.fechaFin)}
    </p>
  );
}
