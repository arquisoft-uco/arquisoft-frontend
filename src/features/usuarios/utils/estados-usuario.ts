import type { EstadoUsuario } from '../models/EstadoUsuario';
import type { Usuario } from '../models/Usuario';

export const ESTADO_ACTIVO = 'ACTIVO';

export interface TextosCambioEstado {
  titulo: string;
  descripcion: string;
  labelConfirmar: string;
  exito: { titulo: string; mensaje: string };
  error: string;
}

export function nombreEstadoUsuario(estados: EstadoUsuario[] | undefined, id: string): string {
  return estados?.find((estado) => estado.id === id)?.nombre ?? id;
}

function descripcionCambioEstado(
  usuario: Usuario,
  destino: EstadoUsuario,
  estados: EstadoUsuario[] | undefined,
): string {
  const base = `Se cambiará el estado de ${usuario.nombre} de ${nombreEstadoUsuario(estados, usuario.estado)} a ${destino.nombre}.`;
  if (destino.id === ESTADO_ACTIVO) {
    return usuario.vigente ? base : `${base} El usuario será restaurado.`;
  }
  return `${base} Se deshabilitará su acceso.`;
}

export function textosCambioEstado(
  usuario: Usuario,
  destino: EstadoUsuario,
  estados: EstadoUsuario[] | undefined,
): TextosCambioEstado {
  const descripcion = descripcionCambioEstado(usuario, destino, estados);

  if (destino.id === ESTADO_ACTIVO && !usuario.vigente) {
    return {
      titulo: `¿Restaurar a ${usuario.nombre}?`,
      descripcion,
      labelConfirmar: 'Restaurar usuario',
      exito: { titulo: 'Usuario restaurado', mensaje: `${usuario.nombre} volvió a estar vigente.` },
      error: 'No se pudo restaurar al usuario',
    };
  }

  return {
    titulo: `¿Cambiar el estado de ${usuario.nombre}?`,
    descripcion,
    labelConfirmar: 'Cambiar estado',
    exito: {
      titulo: 'Estado actualizado',
      mensaje: `${usuario.nombre} ahora está en estado ${destino.nombre}.`,
    },
    error: 'No se pudo cambiar el estado',
  };
}
