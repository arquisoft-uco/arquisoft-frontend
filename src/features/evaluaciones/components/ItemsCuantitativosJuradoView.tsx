import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Notice from '../../../shared/components/ui/Notice';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useHasRole } from '../../../hooks/useHasRole';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import { useItemsCuantitativosJurado } from '../hooks/useItemsCuantitativosJurado';
import ItemsCuantitativosJuradoTable from './ItemsCuantitativosJuradoTable';
import RegistrarItemCuantitativoJuradoPanel from './RegistrarItemCuantitativoJuradoPanel';

const ROLES_ADMINISTRAN = [Rol.Administrador];

export default function ItemsCuantitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCuantitativosJurado();
  const categorias = useCategoriasItemCuantitativoJurado();
  const esAdministrador = useHasRole(ROLES_ADMINISTRAN);
  const [registrando, setRegistrando] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-header">
        <p className="text-sm text-on-surface-secondary">
          Valores máximos con los que el jurado puntúa cada proyecto.
        </p>
        {esAdministrador && (
          <Button icono={Plus} className="header-action" onClick={() => setRegistrando(true)}>
            Registrar ítem
          </Button>
        )}
      </div>

      {isLoading && (
        <Skeleton variante="tabla" etiqueta="Cargando ítems cuantitativos del jurado" />
      )}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cuantitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && categorias.isError && (
        <Notice variante="advertencia">No se pudieron cargar los nombres de las categorías.</Notice>
      )}

      {data && (
        <ItemsCuantitativosJuradoTable
          items={data}
          categorias={categorias.data}
          cargandoCategorias={categorias.isLoading}
        />
      )}

      {registrando && (
        <RegistrarItemCuantitativoJuradoPanel onCerrar={() => setRegistrando(false)} />
      )}
    </div>
  );
}
