import { useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import ErrorState from '../../../shared/components/ui/ErrorState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Skeleton from '../../../shared/components/ui/Skeleton';
import { Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useHasRole } from '../../../hooks/useHasRole';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import CriteriosItemCualitativoJuradoPanel from './CriteriosItemCualitativoJuradoPanel';
import ItemsCualitativosJuradoTable from './ItemsCualitativosJuradoTable';
import ModificarItemCualitativoJuradoPanel from './ModificarItemCualitativoJuradoPanel';
import RegistrarItemCualitativoJuradoPanel from './RegistrarItemCualitativoJuradoPanel';

const ROLES_ADMINISTRAN = [Rol.Administrador];

type PanelItems =
  | { tipo: 'registrar' }
  | { tipo: 'criterios' }
  | { tipo: 'modificar'; item: ItemCualitativoJurado };

export default function ItemsCualitativosJuradoView() {
  const { data, isLoading, isError, error, refetch } = useItemsCualitativosJurado();
  const esAdministrador = useHasRole(ROLES_ADMINISTRAN);
  const [panel, setPanel] = useState<PanelItems | null>(null);

  function cerrarPanel() {
    setPanel(null);
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        titulo="Ítems cualitativos del jurado"
        descripcion="Criterios con los que el jurado valora cada proyecto."
        acciones={
          <>
            <Button
              variante="fantasma"
              tamano="sm"
              icono={ListChecks}
              aria-haspopup="dialog"
              onClick={() => setPanel({ tipo: 'criterios' })}
            >
              Ver criterios
            </Button>
            {esAdministrador && (
              <Button icono={Plus} onClick={() => setPanel({ tipo: 'registrar' })}>
                Registrar ítem
              </Button>
            )}
          </>
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

      {data && (
        <ItemsCualitativosJuradoTable
          items={data}
          onEditar={esAdministrador ? (item) => setPanel({ tipo: 'modificar', item }) : undefined}
        />
      )}

      {panel?.tipo === 'registrar' && (
        <RegistrarItemCualitativoJuradoPanel onCerrar={cerrarPanel} />
      )}
      {panel?.tipo === 'criterios' && (
        <CriteriosItemCualitativoJuradoPanel onCerrar={cerrarPanel} />
      )}
      {panel?.tipo === 'modificar' && (
        <ModificarItemCualitativoJuradoPanel
          key={panel.item.id}
          item={panel.item}
          onCerrar={cerrarPanel}
        />
      )}
    </div>
  );
}
