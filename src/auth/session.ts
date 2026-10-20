import { useAuthStore } from './authStore';
import { useProveedorStore } from './proveedorStore';
import { useRoleStore } from './roleStore';
import type { ProveedorId, SesionRestaurada } from './proveedores/proveedor';
import { fijarProveedorActivo, proveedorActivo } from './proveedores/proveedorActivo';
import { crearProveedor, proveedoresDisponibles } from './proveedores/proveedores';

function alActualizar(sesion: SesionRestaurada): void {
  useAuthStore.setState({ token: sesion.token, tokenParsed: sesion.tokenParsed });
}

// El proveedor recordado solo cuenta si sigue disponible; con uno solo disponible no hay nada que elegir.
export function resolverProveedor(): ProveedorId | null {
  const disponibles = proveedoresDisponibles();
  const recordado = useProveedorStore.getState().proveedor;
  if (recordado && disponibles.some((definicion) => definicion.id === recordado)) return recordado;
  if (disponibles.length === 1) return disponibles[0].id;
  return null;
}

// Si el proveedor deja el login en curso (redirección), el store queda sin escribir.
export async function restaurarSesion(): Promise<void> {
  const id = resolverProveedor();
  if (!id) throw new Error('[auth] No hay un proveedor de identidad elegido.');

  useProveedorStore.getState().elegirProveedor(id);
  const proveedor = crearProveedor(id);
  fijarProveedorActivo(proveedor);

  const sesion = await proveedor.restaurarSesion(alActualizar);
  if (!sesion) return;

  useAuthStore.getState().setAuth({
    authenticated: true,
    token: sesion.token,
    tokenParsed: sesion.tokenParsed,
    username: sesion.username,
  });
}

export async function verificarSesionActiva(): Promise<void> {
  const proveedor = proveedorActivo();
  if (!proveedor) throw new Error('[auth] No hay un proveedor de identidad activo.');

  const sesion = await proveedor.restaurarSesion(alActualizar);
  if (!sesion) throw new Error('[auth] La sesión no está activa.');
}

export async function cerrarSesion(redirectUri: string = window.location.origin): Promise<void> {
  try {
    await proveedorActivo()?.cerrarSesion(redirectUri);
  } finally {
    useAuthStore.getState().reset();
    useRoleStore.getState().clearRolSeleccionado();
    useProveedorStore.getState().limpiarProveedor();
    fijarProveedorActivo(null);
  }
}
