import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';

interface Props {
  hayFiltros: boolean;
  onLimpiarFiltros: () => void;
}

export default function VacioParticipaciones({ hayFiltros, onLimpiarFiltros }: Props) {
  if (hayFiltros) {
    return (
      <EmptyState
        icono={SearchX}
        titulo="Sin resultados"
        descripcion="No hay artefactos que coincidan con los filtros."
        accion={
          <Button variante="secundario" onClick={onLimpiarFiltros}>
            Limpiar filtros
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icono={FileStack}
      titulo="Aún no participas en artefactos"
      descripcion="Aparecerán aquí cuando te asignen a un artefacto de tus proyectos de grado."
    />
  );
}
