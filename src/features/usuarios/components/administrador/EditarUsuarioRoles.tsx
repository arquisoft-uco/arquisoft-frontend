import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Badge from '../../../../shared/components/ui/Badge';
import Notice from '../../../../shared/components/ui/Notice';
import { ETIQUETAS_ROL, type Rol } from '../../../../shared/models/rol';
import { useAgregarRol } from '../../hooks/useAgregarRol';
import { useRemoverRol } from '../../hooks/useRemoverRol';
import type { Usuario } from '../../models/Usuario';
import {
  DESCRIPCIONES_ROL,
  ROLES_DEL_PANEL,
  puedeCambiarRol,
  rolesDeUsuario,
} from '../../utils/roles-usuario';
import Switch from '../Switch';

const RAIZ = 'flex flex-col gap-4';
const CONSECUENCIAS: string[] = [
  'Dejará de tener acceso a lo que ese rol permite.',
  'Puedes volver a asignárselo cuando quieras.',
];

interface PropsFila {
  usuario: Usuario;
  rol: Rol;
  asignado: boolean;
  quitando: boolean;
  onAgregado: (rol: Rol) => void;
  onApagar: (rol: Rol) => void;
}

// Cada fila tiene su propia mutación: el estado pendiente es del interruptor que corre, no del panel.
function FilaRol({ usuario, rol, asignado, quitando, onAgregado, onApagar }: PropsFila) {
  const agregar = useAgregarRol();
  const cambiable = puedeCambiarRol(rol, asignado);

  function agregarRol() {
    agregar.mutate(
      { usuarioId: usuario.id, rol, nombre: usuario.nombre },
      { onSuccess: () => onAgregado(rol) },
    );
  }

  function cambiar(encendido: boolean) {
    if (encendido) agregarRol();
    else onApagar(rol);
  }

  return (
    <Switch
      etiqueta={ETIQUETAS_ROL[rol]}
      descripcion={DESCRIPCIONES_ROL[rol]}
      marcado={asignado}
      onCambiar={cambiar}
      deshabilitado={!cambiable}
      insignia={!cambiable && <Badge variante="neutro">Pronto</Badge>}
      pendiente={agregar.isPending || quitando}
    />
  );
}

interface Props {
  usuario: Usuario;
}

export default function EditarUsuarioRoles({ usuario }: Props) {
  const [rolesAsignados, setRolesAsignados] = useState<ReadonlySet<Rol>>(
    () => new Set(rolesDeUsuario(usuario)),
  );
  const remover = useRemoverRol();
  const { objetivo } = remover;

  function registrarAgregado(rol: Rol) {
    setRolesAsignados((previos) => new Set(previos).add(rol));
  }

  function solicitarQuitar(rol: Rol) {
    remover.solicitar({ usuarioId: usuario.id, nombre: usuario.nombre, rol });
  }

  function quitarRol() {
    if (!objetivo) return;
    const { rol } = objetivo;
    remover.confirmar(() =>
      setRolesAsignados((previos) => {
        const siguientes = new Set(previos);
        siguientes.delete(rol);
        return siguientes;
      }),
    );
  }

  return (
    <div className={RAIZ}>
      <Notice variante="info">
        Los cambios de rol se aplican al instante. Quitar un rol pedirá confirmación.
      </Notice>
      <div>
        {ROLES_DEL_PANEL.map((rol) => (
          <FilaRol
            key={rol}
            usuario={usuario}
            rol={rol}
            asignado={rolesAsignados.has(rol)}
            quitando={remover.isPending && objetivo?.rol === rol}
            onAgregado={registrarAgregado}
            onApagar={solicitarQuitar}
          />
        ))}
      </div>
      {objetivo && (
        <ConfirmDialog
          variante="peligro"
          titulo={`¿Quitar el rol ${ETIQUETAS_ROL[objetivo.rol]} a ${objetivo.nombre}?`}
          descripcion={`${objetivo.nombre} dejará de tener el rol ${ETIQUETAS_ROL[objetivo.rol]}.`}
          consecuencias={CONSECUENCIAS}
          labelConfirmar="Quitar"
          cargando={remover.isPending}
          onConfirmar={quitarRol}
          onCancelar={remover.cancelar}
        />
      )}
    </div>
  );
}
