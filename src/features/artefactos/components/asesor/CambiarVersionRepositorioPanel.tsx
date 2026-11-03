import { useState, type SyntheticEvent } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { useCambiarVersionRepositorioArtefacto } from '../../hooks/useCambiarVersionRepositorioArtefacto';
import { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import { useVersionesElegiblesArtefacto } from '../../hooks/useVersionesElegiblesArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { puedeCambiarVersionRepositorio } from '../../utils/cambio-version-repositorio';
import {
  esErrorDeCampoVersion,
  mensajeErrorCambioVersionRepositorio,
} from '../../utils/errores-cambio-version-repositorio';
import CambiarVersionRepositorioCuerpo from './CambiarVersionRepositorioCuerpo';

const ID_FORMULARIO = 'cambiar-version-repositorio-artefacto';
const CONSECUENCIAS = [
  'Cada estudiante vinculado recibirá un correo con el cambio.',
  'Las versiones, revisiones y observaciones ya registradas no se modifican.',
];

interface Props {
  artefacto: ArtefactoAsesor;
  onCerrar: () => void;
}

export default function CambiarVersionRepositorioPanel({ artefacto, onCerrar }: Props) {
  const [seleccion, setSeleccion] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [errorCampo, setErrorCampo] = useState<string | undefined>();
  const ultima = useUltimaVersionArtefacto(artefacto.id, true);
  const candidatas = useVersionesElegiblesArtefacto(artefacto, true);
  const { mutate, isPending } = useCambiarVersionRepositorioArtefacto();

  const estadoConocido = !ultima.isError && ultima.ultimaVersion !== undefined;
  const bloqueado = estadoConocido && !puedeCambiarVersionRepositorio(ultima.ultimaVersion ?? null);
  const listoParaElegir =
    estadoConocido && !bloqueado && !candidatas.isLoading && !candidatas.isError;
  const versionNueva = candidatas.versiones.find((version) => version.id === seleccion);

  function elegir(id: string) {
    setSeleccion(id);
    setErrorCampo(undefined);
  }

  function solicitarConfirmacion(evento: SyntheticEvent) {
    evento.preventDefault();
    if (seleccion) setConfirmando(true);
  }

  function confirmar() {
    mutate(
      { artefactoId: artefacto.id, versionRepositorioId: seleccion },
      {
        onSuccess: () => {
          toast.success(
            'Versión actualizada',
            'La versión del repositorio del artefacto fue cambiada correctamente.',
          );
          setConfirmando(false);
          onCerrar();
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambioVersionRepositorio(err, 'Inténtalo nuevamente.');
          if (esErrorDeCampoVersion(err)) setErrorCampo(mensaje);
          toast.error('No se pudo cambiar la versión', mensaje);
          setConfirmando(false);
        },
      },
    );
  }

  return (
    <SidePanel
      titulo="Cambiar versión del repositorio"
      descripcion={`${artefacto.nombreDocumento} · ${artefacto.nombreProyecto}`}
      onCerrar={onCerrar}
      sucio={seleccion !== ''}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Cambiar versión"
          accionEnviando="Cambiando…"
          formId={ID_FORMULARIO}
          sucio={seleccion !== ''}
          sinCambios={seleccion === '' || !listoParaElegir}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form id={ID_FORMULARIO} onSubmit={solicitarConfirmacion} noValidate>
        <CambiarVersionRepositorioCuerpo
          artefacto={artefacto}
          ultima={ultima}
          candidatas={candidatas}
          bloqueado={bloqueado}
          seleccion={seleccion}
          errorCampo={errorCampo}
          onElegir={elegir}
        />
      </form>
      {confirmando && versionNueva && (
        <ConfirmDialog
          titulo="¿Cambiar la versión del repositorio?"
          descripcion={`${artefacto.nombreDocumento} pasará de la versión ${artefacto.versionDocumento} a la versión ${versionNueva.numeroVersion}.`}
          consecuencias={CONSECUENCIAS}
          labelConfirmar="Sí, cambiar versión"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </SidePanel>
  );
}
