import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { useRegistrarRevision } from '../../hooks/useRegistrarRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { mensajeDeErrorRegistrarRevision } from '../../utils/errores-registrar-revision';
import { reabreArtefacto } from '../../utils/revision-version';

interface Textos {
  titulo: string;
  aviso?: string;
  consecuencias: string[];
  confirmar: string;
  exito: string;
  errorTitulo: string;
}

const TEXTOS: Record<'registrar' | 'reabrir', Textos> = {
  registrar: {
    titulo: '¿Registrar revisión?',
    consecuencias: [
      'La revisión queda pendiente y no se notifica a los estudiantes.',
      'Mientras esté pendiente, los estudiantes no podrán subir versiones nuevas.',
    ],
    confirmar: 'Registrar revisión',
    exito: 'Revisión registrada',
    errorTitulo: 'No se pudo registrar la revisión',
  },
  reabrir: {
    titulo: '¿Reabrir la revisión de esta versión?',
    aviso:
      'Esta acción va por encima del ciclo de vida de la versión del artefacto. Úsala solo si detectaste a última hora algo que falta en esta versión.',
    consecuencias: [
      'Se crea una nueva revisión en estado pendiente sobre esta misma versión.',
      'El artefacto se reabre.',
      'Mientras esté pendiente, los estudiantes no podrán subir versiones nuevas.',
      'No se notifica a los estudiantes.',
    ],
    confirmar: 'Reabrir revisión',
    exito: 'Revisión reabierta',
    errorTitulo: 'No se pudo reabrir la revisión',
  },
};

interface Props {
  version: VersionArtefacto;
  onCerrar: () => void;
  onRegistrada?: (revisionAsesorId: string) => void;
}

export default function RegistrarRevisionDialog({ version, onCerrar, onRegistrada }: Props) {
  const { mutate, isPending } = useRegistrarRevision();
  const reabre = reabreArtefacto(version);
  const textos = TEXTOS[reabre ? 'reabrir' : 'registrar'];
  const objetivo = `de la versión ${version.version} de «${version.nombreDocumento}»`;

  function handleConfirmar() {
    mutate(version.id, {
      onSuccess: (respuesta) => {
        toast.success(
          textos.exito,
          `Quedó pendiente ${reabre ? 'una nueva' : 'la'} revisión ${objetivo}.`,
        );
        onCerrar();
        onRegistrada?.(respuesta.id);
      },
      onError: (err) => {
        toast.error(textos.errorTitulo, mensajeDeErrorRegistrarRevision(err));
        onCerrar();
      },
    });
  }

  return (
    <ConfirmDialog
      variante="advertencia"
      titulo={textos.titulo}
      descripcion={`Vas a ${reabre ? 'reabrir' : 'registrar'} ${reabre ? 'la' : 'una'} revisión ${objetivo} del proyecto «${version.nombreProyecto}».`}
      aviso={textos.aviso}
      consecuencias={textos.consecuencias}
      labelConfirmar={textos.confirmar}
      cargando={isPending}
      onConfirmar={handleConfirmar}
      onCancelar={onCerrar}
    />
  );
}
