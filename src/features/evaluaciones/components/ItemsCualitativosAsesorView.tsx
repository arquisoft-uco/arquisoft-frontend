import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { useHasRole } from '../../../hooks/useHasRole';
import { Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';
import CriteriosItemCualitativoAsesorPanel from './CriteriosItemCualitativoAsesorPanel';
import ItemsCualitativosAsesorTable from './ItemsCualitativosAsesorTable';
import ModificarItemCualitativoAsesorPanel from './ModificarItemCualitativoAsesorPanel';
import RegistrarItemCualitativoAsesorPanel from './RegistrarItemCualitativoAsesorPanel';

const ROLES_ADMINISTRAN = [Rol.Administrador];

export default function ItemsCualitativosAsesorView() {
  const esAdministrador = useHasRole(ROLES_ADMINISTRAN);
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosAsesor();
  const [criteriosAbiertos, setCriteriosAbiertos] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [itemEnEdicion, setItemEnEdicion] = useState<ItemCualitativoAsesor | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="section-header">
        <p className="text-sm text-on-surface-secondary">
          Ítems con los que el asesor evalúa cada proyecto.
        </p>
        <Button
          variante="fantasma"
          tamano="sm"
          icono={ListChecks}
          className="header-action"
          aria-haspopup="dialog"
          onClick={() => setCriteriosAbiertos(true)}
        >
          Ver criterios
        </Button>
        {esAdministrador && (
          <Button icono={Plus} className="header-action" onClick={() => setRegistrando(true)}>
            Registrar ítem
          </Button>
        )}
      </div>

      {isLoading && <Skeleton variante="tabla" etiqueta="Cargando ítems cualitativos del asesor" />}

      {isError && (
        <ErrorState
          titulo="No se pudieron cargar los ítems cualitativos del asesor."
          descripcion={getApiErrorMessage(error, 'Intenta nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}

      {data && (
        <ItemsCualitativosAsesorTable
          items={data}
          onEditar={esAdministrador ? setItemEnEdicion : undefined}
        />
      )}

      {esAdministrador && registrando && (
        <RegistrarItemCualitativoAsesorPanel onCerrar={() => setRegistrando(false)} />
      )}

      {esAdministrador && itemEnEdicion && (
        <ModificarItemCualitativoAsesorPanel
          key={itemEnEdicion.id}
          item={itemEnEdicion}
          onCerrar={() => setItemEnEdicion(null)}
        />
      )}

      {criteriosAbiertos && (
        <CriteriosItemCualitativoAsesorPanel onCerrar={() => setCriteriosAbiertos(false)} />
      )}
    </div>
  );
}
