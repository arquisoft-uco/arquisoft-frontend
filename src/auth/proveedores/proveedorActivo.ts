import type { ProveedorIdentidad } from './proveedor';

let activo: ProveedorIdentidad | null = null;

export function fijarProveedorActivo(proveedor: ProveedorIdentidad | null): void {
  activo = proveedor;
}

export function proveedorActivo(): ProveedorIdentidad | null {
  return activo;
}
