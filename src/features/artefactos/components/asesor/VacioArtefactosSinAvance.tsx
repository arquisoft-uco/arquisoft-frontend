import { FileStack, SearchX } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';

interface Props {
  hayFiltros: boolean;
  dias: number;
  onLimpiarFiltros: () => void;
}

export default function VacioArtefactosSinAvance({ hayFiltros, dias, onLimpiarFiltros }: Props) {
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
      titulo={`Ningún artefacto supera ${dias} días sin avance`}
      descripcion="Prueba con un plazo menor para ver artefactos con avances más recientes."
    />
  );
}
