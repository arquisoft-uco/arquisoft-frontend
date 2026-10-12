import { ClipboardCheck } from 'lucide-react';
import { toast } from '../../../../shared/hooks/useToast';
import Badge from '../../../../shared/components/ui/Badge';
import IconButton from '../../../../shared/components/ui/IconButton';
import { getApiErrorMessage, hasApiErrorCode } from '../../../../shared/utils/api-error';
import { varianteEstadoRevision } from '../../../../shared/utils/estado-variante';
import { useAgregarRevisionItem } from '../../hooks/useAgregarRevisionItem';
import { useItemsFichaAsesor } from '../../hooks/useItemsFichaAsesor';
import { useRevisionesPorItemAsesor } from '../../hooks/useRevisionesPorItemAsesor';
import AyudaTiposItem from '../AyudaTiposItem';
import ItemsFichaLista from '../ItemsFichaLista';

interface Props {
  fichaPerfilId: string;
}

function mensajeError(err: unknown): string {
  if (hasApiErrorCode(err, 'REVISION_ITEM_YA_EXISTE')) return 'Este ítem ya tiene una revisión.';
  if (hasApiErrorCode(err, 'ITEM_NO_ENCONTRADO')) return 'El ítem ya no existe.';
  if (hasApiErrorCode(err, 'FICHA_NO_PERTENECE_ASESOR')) return 'Esta ficha no está asignada a ti.';
  return getApiErrorMessage(err, 'No se pudo agregar la revisión.');
}

export default function ItemsFichaAsesorPanel({ fichaPerfilId }: Props) {
  const { data, isLoading, isError, refetch } = useItemsFichaAsesor(fichaPerfilId);
  const { revisionPorItem, isLoading: cargandoRevisiones } =
    useRevisionesPorItemAsesor(fichaPerfilId);
  const agregar = useAgregarRevisionItem(fichaPerfilId);

  function agregarRevision(itemId: string) {
    agregar.mutate(itemId, {
      onSuccess: () => toast.success('Revisión agregada', 'El ítem quedó en revisión.'),
      onError: (err) => toast.error('No se pudo agregar la revisión', mensajeError(err)),
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <AyudaTiposItem />
      <div className="w-full">
        <ItemsFichaLista
          items={data}
          cargando={isLoading}
          error={isError}
          onReintentar={refetch}
          insignias={(item) => {
            const revision = revisionPorItem.get(item.id);
            if (!revision) return null;
            return (
              <Badge variante={varianteEstadoRevision(revision.estadoId)}>
                {revision.estadoNombre}
              </Badge>
            );
          }}
          acciones={(item) => {
            if (revisionPorItem.has(item.id)) return null;
            return (
              <IconButton
                tono="primario"
                icono={ClipboardCheck}
                etiqueta={`Agregar revisión al ítem ${item.tipoItem.nombre}`}
                disabled={
                  cargandoRevisiones || (agregar.isPending && agregar.variables === item.id)
                }
                onClick={() => agregarRevision(item.id)}
              />
            );
          }}
        />
      </div>
    </div>
  );
}
