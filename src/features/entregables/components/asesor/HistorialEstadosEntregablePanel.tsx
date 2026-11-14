import { History } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import LineaTiempo from '../../../../shared/components/ui/LineaTiempo';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { varianteEstadoEntregable } from '../../../../shared/utils/estado-variante';
import { useHistorialEstadosEntregable } from '../../hooks/useHistorialEstadosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import { mensajeErrorConsultaEntregable } from '../../utils/errores-entregable';

interface Props {
  entregable: EntregableProyectoGrado;
  onCerrar: () => void;
}

const ETIQUETA_LISTA = 'Historial de estados del entregable';

export default function HistorialEstadosEntregablePanel({ entregable, onCerrar }: Props) {
  const { data, isLoading, isError, error, refetch } = useHistorialEstadosEntregable(entregable.id);

  function contenido() {
    if (isError) {
      return (
        <ErrorState
          titulo="No se pudo cargar el historial de estados"
          descripcion={mensajeErrorConsultaEntregable(error)}
          onReintentar={() => void refetch()}
        />
      );
    }

    if (isLoading || !data) {
      return <Skeleton variante="lineas" etiqueta="Cargando historial de estados…" />;
    }

    if (data.length === 0) {
      return (
        <EmptyState icono={History} titulo="Este entregable aún no tiene estados registrados" />
      );
    }

    const pasos = data.map((h) => ({
      id: h.id,
      nombre: h.estado.nombre,
      variante: varianteEstadoEntregable(h.estado.id),
      fecha: h.fechaActualizacion,
    }));

    return <LineaTiempo etiqueta={ETIQUETA_LISTA} pasos={pasos} />;
  }

  return (
    <SidePanel
      titulo="Historial de estados del entregable"
      descripcion={`${entregable.proyectoGrado.nombre} · Versión ${entregable.versionEntregable}`}
      onCerrar={onCerrar}
    >
      {contenido()}
    </SidePanel>
  );
}
