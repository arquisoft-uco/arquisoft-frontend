import { Map } from 'lucide-react';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useMapaRutaEstudiante } from '../hooks/useMapaRutaEstudiante';
import MapaRutaEstudianteCard from './estudiante/MapaRutaEstudianteCard';

export default function EstudianteView() {
  const { mapa, cargando, sinMapa, hayError, reintentar } = useMapaRutaEstudiante();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mi mapa de ruta"
        descripcion="Consulta las fechas importantes de tu proyecto de grado."
      />
      {cargando && <Skeleton variante="tarjetas" etiqueta="Cargando tu mapa de ruta…" />}
      {sinMapa && (
        <EmptyState
          icono={Map}
          titulo="Aún no tienes un mapa de ruta"
          descripcion="Cuando tu coordinador lo defina para tu proyecto de grado, aparecerá aquí."
        />
      )}
      {hayError && (
        <ErrorState
          titulo="No pudimos cargar tu mapa de ruta"
          descripcion="Inténtalo nuevamente."
          onReintentar={reintentar}
        />
      )}
      {mapa && <MapaRutaEstudianteCard mapa={mapa} />}
    </div>
  );
}
