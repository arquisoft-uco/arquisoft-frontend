import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useCategoriasItemCuantitativoAsesor } from '../hooks/useCategoriasItemCuantitativoAsesor';
import { useItemsCuantitativosAsesor } from '../hooks/useItemsCuantitativosAsesor';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';
import ModificarItemCuantitativoAsesorPanel from './ModificarItemCuantitativoAsesorPanel';
import ItemsCuantitativosAsesorTable from './ItemsCuantitativosAsesorTable';
import RegistrarItemCuantitativoAsesorPanel from './RegistrarItemCuantitativoAsesorPanel';

export default function ItemsCuantitativosAsesorView() {
  const { data, isLoading, isError, error, refetch } = useItemsCuantitativosAsesor();
  const categorias = useCategoriasItemCuantitativoAsesor();
  const [registrando, setRegistrando] = useState(false);
  const [itemEnEdicion, setItemEnEdicion] = useState<ItemCuantitativoAsesor | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-header">
        <p className="text-sm text-on-surface-secondary">
          Valores máximos con los que el asesor puntúa cada proyecto.
        </p>
        <Button icono={Plus} className="header-action" onClick={() => setRegistrando(true)}>
          Registrar ítem
        </Button>
      </div>

      {isLoading && (
        <Skeleton variante="tabla" etiqueta="Cargando ítems cuantitativos del asesor" />
      )}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cuantitativos del asesor."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && categorias.isError && (
        <Notice variante="advertencia">No se pudieron cargar los nombres de las categorías.</Notice>
      )}

      {data && (
        <ItemsCuantitativosAsesorTable
          items={data}
          categorias={categorias.data}
          cargandoCategorias={categorias.isLoading}
          onEditar={setItemEnEdicion}
        />
      )}

      {registrando && (
        <RegistrarItemCuantitativoAsesorPanel onCerrar={() => setRegistrando(false)} />
      )}

      {itemEnEdicion && (
        <ModificarItemCuantitativoAsesorPanel
          key={itemEnEdicion.id}
          item={itemEnEdicion}
          onCerrar={() => setItemEnEdicion(null)}
        />
      )}
    </div>
  );
}
