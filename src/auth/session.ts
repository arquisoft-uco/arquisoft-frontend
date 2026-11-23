import { useAuthStore } from './authStore';
import { useProveedorStore } from './proveedorStore';
import { useRoleStore } from './roleStore';
import type { ProveedorId, SesionRestaurada } from './proveedores/proveedor';
import { fijarProveedorActivo, proveedorActivo } from './proveedores/proveedorActivo';
import { crearProveedor, proveedoresDisponibles } from './proveedores/proveedores';
import { contextoTemporal } from '../shared/utils/contexto-temporal';
import { monitoring } from '../shared/utils/monitoring';

export type ResultadoRestauracion = 'restaurada' | 'login-en-curso' | 'requiere-eleccion';

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

// Única definición de cuándo se muestra el selector; razona por conteo, nunca por proveedor concreto.
export function requiereElegirProveedor(): boolean {
  return resolverProveedor() === null;
}

// Con varios proveedores y uno recordado de una carga anterior se intenta recuperar en silencio; sin sesión se pide elegir.
// Si el proveedor deja el login en curso (redirección), el store queda sin escribir.
export async function restaurarSesion(): Promise<ResultadoRestauracion> {
  const id = resolverProveedor();
  if (!id) throw new Error('[auth] No hay un proveedor de identidad elegido.');

  const silencioso =
    proveedoresDisponibles().length > 1 && !useProveedorStore.getState().confirmadoEnEstaCarga;

  useProveedorStore.getState().elegirProveedor(id);
  const proveedor = crearProveedor(id);
  fijarProveedorActivo(proveedor);

  let sesion: SesionRestaurada | null;
  if (silencioso) {
    try {
      sesion = await proveedor.recuperarSesionSilenciosa(alActualizar);
    } catch (error) {
      monitoring.captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'recuperacion-silenciosa',
      });
      sesion = null;
    }
    if (!sesion) return 'requiere-eleccion';
  } else {
    sesion = await proveedor.restaurarSesion(alActualizar);
    if (!sesion) return 'login-en-curso';
  }

  useAuthStore.getState().setAuth({
    authenticated: true,
    token: sesion.token,
    tokenParsed: sesion.tokenParsed,
    username: sesion.username,
  });
  return 'restaurada';
}

export async function verificarSesionActiva(): Promise<void> {
  const proveedor = proveedorActivo();
  if (!proveedor) throw new Error('[auth] No hay un proveedor de identidad activo.');

  const sesion = await proveedor.restaurarSesion(alActualizar);
  if (!sesion) throw new Error('[auth] La sesión no está activa.');
}

export async function cerrarSesion(redirectUri: string = window.location.origin): Promise<void> {
  contextoTemporal.borrarTodo();
  try {
    await proveedorActivo()?.cerrarSesion(redirectUri);
  } finally {
    useAuthStore.getState().reset();
    useRoleStore.getState().clearRolSeleccionado();
    useProveedorStore.getState().limpiarProveedor();
    fijarProveedorActivo(null);
  }
}
