import { useState } from 'react';
import { Map, Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useMapaRutaEstudiante } from '../hooks/useMapaRutaEstudiante';
import AsignarTareaPanel from './estudiante/AsignarTareaPanel';
import ConsultarTareasMapaRuta from './estudiante/ConsultarTareasMapaRuta';
import MapaRutaEstudianteCard from './estudiante/MapaRutaEstudianteCard';

export default function EstudianteView() {
  const [asignando, setAsignando] = useState(false);
  const { mapa, cargando, sinMapa, hayError, reintentar } = useMapaRutaEstudiante();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mi mapa de ruta"
        descripcion="Consulta las fechas importantes y las tareas de tu proyecto de grado."
        acciones={
          mapa && (
            <Button icono={Plus} onClick={() => setAsignando(true)}>
              Nueva tarea
            </Button>
          )
        }
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
      {mapa && (
        <ConsultarTareasMapaRuta mapaRutaId={mapa.id} onNuevaTarea={() => setAsignando(true)} />
      )}
      {asignando && mapa && <AsignarTareaPanel mapa={mapa} onCerrar={() => setAsignando(false)} />}
    </div>
  );
}
