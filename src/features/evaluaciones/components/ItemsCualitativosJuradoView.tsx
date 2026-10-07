import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useHasRole } from '../../../hooks/useHasRole';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import ItemsCualitativosJuradoTable from './ItemsCualitativosJuradoTable';
import RegistrarItemCualitativoJuradoPanel from './RegistrarItemCualitativoJuradoPanel';

const ROLES_ADMINISTRAN = [Rol.Administrador];

export default function ItemsCualitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosJurado();
  const esAdministrador = useHasRole(ROLES_ADMINISTRAN);
  const [registrando, setRegistrando] = useState(false);

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems cualitativos del jurado"
        descripcion="Criterios con los que el jurado valora cada proyecto."
        acciones={
          esAdministrador && (
            <Button icono={Plus} onClick={() => setRegistrando(true)}>
              Registrar ítem
            </Button>
          )
        }
      />

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del jurado" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del jurado."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && <ItemsCualitativosJuradoTable items={data} />}

      {registrando && (
        <RegistrarItemCualitativoJuradoPanel onCerrar={() => setRegistrando(false)} />
      )}
    </div>
  );
}
