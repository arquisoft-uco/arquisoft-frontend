import { useId, useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCambiarEstadoUsuario } from '../../hooks/useCambiarEstadoUsuario';
import type { EstadoUsuario } from '../../models/EstadoUsuario';
import type { Usuario } from '../../models/Usuario';
import { ESTADO_ACTIVO, textosCambioEstado } from '../../utils/estados-usuario';
import DarDeBajaUsuarioDialog from './DarDeBajaUsuarioDialog';
import EstadoDeLaCuenta from './EstadoDeLaCuenta';

const RAIZ = 'flex flex-col gap-4';
const ZONA = 'flex flex-col items-start gap-3 rounded-xl border border-danger/40 p-4 sm:p-5';
const TITULO_ZONA = 'text-base font-semibold text-danger-muted-foreground';
const TEXTO_ZONA = 'text-sm text-on-surface-secondary';
const TEXTO_VIGENTE =
  'Se deshabilita su acceso y deja de aparecer como vigente. Solo se puede dar de baja a quien ya no tiene roles vigentes.';
const TEXTO_DADO_DE_BAJA = 'Este usuario está dado de baja y no puede iniciar sesión.';

interface EstadosDelCatalogo {
  data?: EstadoUsuario[];
  isLoading: boolean;
  isError: boolean;
}

interface Props {
  usuario: Usuario;
  estados: EstadosDelCatalogo;
  onCerrarPanel: () => void;
}

export default function EditarUsuarioAcceso({ usuario, estados, onCerrarPanel }: Props) {
  const idZona = useId();
  const cambiarEstado = useCambiarEstadoUsuario();
  const [seleccion, setSeleccion] = useState(usuario.estado);
  const [destino, setDestino] = useState<EstadoUsuario | null>(null);
  const [bajaAbierta, setBajaAbierta] = useState(false);

  const estadoActivo = estados.data?.find((estado) => estado.id === ESTADO_ACTIVO);
  const textos = destino ? textosCambioEstado(usuario, destino, estados.data) : null;

  function aplicarSeleccion() {
    const elegido = estados.data?.find((estado) => estado.id === seleccion);
    if (elegido) setDestino(elegido);
  }

  function restaurar() {
    if (estadoActivo) setDestino(estadoActivo);
  }

  function confirmarCambio() {
    if (!destino || !textos) return;
    cambiarEstado.mutate(
      { usuarioId: usuario.id, req: { estado: destino.id } },
      {
        onSuccess: () => {
          toast.success(textos.exito.titulo, textos.exito.mensaje);
          onCerrarPanel();
        },
        onError: (err) => {
          toast.error(textos.error, getApiErrorMessage(err, 'Inténtalo nuevamente.'));
        },
        onSettled: () => setDestino(null),
      },
    );
  }

  return (
    <div className={RAIZ}>
      <EstadoDeLaCuenta
        estados={estados.data}
        cargando={estados.isLoading}
        error={estados.isError}
        actual={usuario.estado}
        valor={seleccion}
        onCambiar={setSeleccion}
        aplicando={cambiarEstado.isPending}
        onAplicar={aplicarSeleccion}
      />

      <section aria-labelledby={idZona} className={ZONA}>
        <h2 id={idZona} className={TITULO_ZONA}>
          Dar de baja
        </h2>
        <p className={TEXTO_ZONA}>{usuario.vigente ? TEXTO_VIGENTE : TEXTO_DADO_DE_BAJA}</p>
        {usuario.vigente ? (
          <Button variante="peligroContorno" onClick={() => setBajaAbierta(true)}>
            Dar de baja…
          </Button>
        ) : (
          <Button variante="secundario" disabled={!estadoActivo} onClick={restaurar}>
            Restaurar usuario
          </Button>
        )}
      </section>

      {destino && textos && (
        <ConfirmDialog
          variante="advertencia"
          titulo={textos.titulo}
          descripcion={textos.descripcion}
          labelConfirmar={textos.labelConfirmar}
          cargando={cambiarEstado.isPending}
          onConfirmar={confirmarCambio}
          onCancelar={() => setDestino(null)}
        />
      )}

      {bajaAbierta && (
        <DarDeBajaUsuarioDialog
          usuario={usuario}
          onCerrar={() => setBajaAbierta(false)}
          onBajaExitosa={onCerrarPanel}
        />
      )}
    </div>
  );
}
