import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useOmitirArtefacto } from '../../hooks/useOmitirArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { mensajeDeErrorOmitir } from '../../utils/errores-omitir-artefacto';

const CONSECUENCIAS = [
  'Los estudiantes vinculados recibirán un correo.',
  'No admitirá cambios: ni estudiantes, ni revisiones, ni observaciones, ni versiones nuevas.',
  'Conserva sus versiones, revisiones, observaciones y vínculos. Puedes reactivarlo asignándolo de nuevo.',
];

interface Props {
  artefacto: ArtefactoAsesor;
  onCerrar: () => void;
}

export default function OmitirArtefactoDialog({ artefacto, onCerrar }: Props) {
  const { mutate, isPending } = useOmitirArtefacto();

  function handleConfirmar() {
    mutate(artefacto.id, {
      onSuccess: () => {
        toast.success(
          'Artefacto omitido',
          `«${artefacto.nombreDocumento}» quedó omitido en «${artefacto.nombreProyecto}».`,
        );
        onCerrar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo omitir el artefacto',
          mensajeDeErrorOmitir(err, artefacto.nombreDocumento),
        );
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo="¿Omitir artefacto?"
      descripcion={`Vas a omitir «${artefacto.nombreDocumento}» (versión ${artefacto.versionDocumento}) del proyecto «${artefacto.nombreProyecto}».`}
      consecuencias={CONSECUENCIAS}
      labelConfirmar="Omitir artefacto"
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
