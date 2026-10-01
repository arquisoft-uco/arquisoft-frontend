import type { EstadoUsuario } from '../models/EstadoUsuario';

export function nombreEstadoUsuario(estados: EstadoUsuario[] | undefined, id: string): string {
  return estados?.find((estado) => estado.id === id)?.nombre ?? id;
}
