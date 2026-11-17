import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import type { EntregableDisponible } from '../models/EntregableDisponible';

const SIN_TITULO = 'Sin título';
const CONSECUENCIAS = [
  'Los autores del proyecto quedan vinculados a la documentación.',
  'El entregable sale de «Por registrar».',
  'Esta acción no se puede deshacer.',
];

interface Props {
  entregable: EntregableDisponible;
  cargando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarRegistroDocumentacion({
  entregable,
  cargando,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <ConfirmDialog
      variante="advertencia"
      titulo="¿Registrar la documentación?"
      descripcion={`${entregable.tituloProyecto ?? SIN_TITULO} · Versión ${entregable.versionEntregable}`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Registrar"
      cargando={cargando}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
    />
  );
}
