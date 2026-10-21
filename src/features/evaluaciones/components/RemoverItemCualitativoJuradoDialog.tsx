import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { useRemoverItemCualitativoJurado } from '../hooks/useRemoverItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import {
  ITEM_CUALITATIVO_JURADO_EN_USO,
  ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO,
} from '../utils/codigos-error-evaluaciones';

const CONSECUENCIAS = [
  'Dejará de estar disponible para las evaluaciones de jurado.',
  'No se puede deshacer.',
];
const MENSAJE_NO_ENCONTRADO = 'El ítem ya no existe.';
const MENSAJE_RESPALDO = 'Inténtalo nuevamente.';

interface Props {
  item: ItemCualitativoJurado;
  onCerrar: () => void;
}

function mensajeDeError(err: unknown, nombre: string): string {
  if (hasApiErrorCode(err, ITEM_CUALITATIVO_JURADO_EN_USO)) {
    return `No se puede remover «${nombre}» porque ya fue usado en evaluaciones de jurado.`;
  }
  if (hasApiErrorCode(err, ITEM_CUALITATIVO_JURADO_NO_ENCONTRADO)) return MENSAJE_NO_ENCONTRADO;
  return getApiErrorMessage(err, MENSAJE_RESPALDO);
}

export default function RemoverItemCualitativoJuradoDialog({ item, onCerrar }: Props) {
  const { mutate, isPending } = useRemoverItemCualitativoJurado();

  function handleConfirmar() {
    mutate(item.id, {
      onSuccess: () => {
        toast.success('Ítem removido', `El ítem «${item.nombre}» fue removido correctamente.`);
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo remover el ítem', mensajeDeError(err, item.nombre));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="peligro"
      titulo="¿Remover ítem?"
      descripcion={`Vas a remover el ítem «${item.nombre}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Remover"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
