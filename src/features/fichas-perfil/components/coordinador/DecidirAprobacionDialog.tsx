import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useAgregarEstadoAprobacionFichaPerfil } from '../../hooks/useAgregarEstadoAprobacionFichaPerfil';
import type { FichaPerfil } from '../../models/FichaPerfil';

const TEXTOS = {
  aprobar: {
    titulo: 'Aprobar ficha',
    variante: 'advertencia',
    consecuencias: [
      'Se notificará por correo a los estudiantes vigentes de la ficha.',
      'Se creará el proyecto de grado de la ficha.',
      'El estado final (aprobada o aprobada con observaciones) depende de las observaciones de las evaluaciones.',
      'La decisión no se puede deshacer.',
    ],
    exito: 'Ficha aprobada',
    mensajeExito: 'La decisión se registró correctamente.',
    fallo: 'No se pudo aprobar la ficha',
  },
  noAprobar: {
    titulo: 'No aprobar ficha',
    variante: 'peligro',
    consecuencias: [
      'Se notificará por correo a los estudiantes vigentes de la ficha.',
      'La ficha quedará como no aprobada.',
      'La decisión no se puede deshacer.',
    ],
    exito: 'Ficha no aprobada',
    mensajeExito: 'La decisión se registró correctamente.',
    fallo: 'No se pudo registrar la no aprobación',
  },
} as const;

interface Props {
  ficha: FichaPerfil;
  acepta: boolean;
  onCerrar: () => void;
}

export default function DecidirAprobacionDialog({ ficha, acepta, onCerrar }: Props) {
  const { mutate, isPending } = useAgregarEstadoAprobacionFichaPerfil(ficha.id);
  const textos = acepta ? TEXTOS.aprobar : TEXTOS.noAprobar;

  function confirmar() {
    mutate(acepta, {
      onSuccess: () => {
        toast.success(textos.exito, textos.mensajeExito);
        onCerrar();
      },
      onError: (err) => {
        toast.error(textos.fallo, getApiErrorMessage(err, 'Inténtalo nuevamente.'));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      titulo={textos.titulo}
      descripcion={`Ficha «${ficha.tituloProyecto}».`}
      consecuencias={[...textos.consecuencias]}
      labelConfirmar={textos.titulo}
      variante={textos.variante}
      cargando={isPending}
      onConfirmar={confirmar}
      onCancelar={onCerrar}
    />
  );
}
