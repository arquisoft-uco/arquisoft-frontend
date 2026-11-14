import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';

interface Props {
  hayFiltros: boolean;
  onLimpiarFiltros: () => void;
}

export default function ArtefactosAsesorVacio({ hayFiltros, onLimpiarFiltros }: Props) {
  if (hayFiltros) {
    return (
      <EmptyState
        icono={SearchX}
        titulo="Sin resultados"
        descripcion="No hay artefactos que coincidan con los filtros aplicados."
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
      titulo="Aún no tienes artefactos asignados"
      descripcion="Aparecerán aquí cuando un proyecto de grado te asigne como asesor de un artefacto."
    />
  );
}
