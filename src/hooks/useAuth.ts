import { useMemo } from 'react';
import { useAuthStore, parseRoles } from '../auth/authStore';
import { useProveedorStore } from '../auth/proveedorStore';
import type { Capacidad, DefinicionProveedor } from '../auth/proveedores/proveedor';
import { definicionDe, proveedoresDisponibles } from '../auth/proveedores/proveedores';
import { useRoleStore } from '../auth/roleStore';
import { AUTH_BYPASS } from '../config/env';
import { Rol } from '../shared/models/rol';

const ROL_VALUES = new Set<string>(Object.values(Rol));

function isValidRol(value: string): value is Rol {
  return ROL_VALUES.has(value);
}

// Roles del JWT reconocidos por el enum del sistema.
export function useRolesDisponibles(): Rol[] {
  const tokenParsed = useAuthStore((s) => s.tokenParsed);
  return useMemo(() => parseRoles(tokenParsed).filter(isValidRol) as Rol[], [tokenParsed]);
}

// Rol activo derivado: el guardado si sigue en el JWT; el único rol si solo hay uno; si no, null.
export function useRolActivo(): Rol | null {
  const rolesDisponibles = useRolesDisponibles();
  const rolSeleccionado = useRoleStore((s) => s.rolSeleccionado);

  return useMemo(() => {
    if (rolSeleccionado && rolesDisponibles.includes(rolSeleccionado)) return rolSeleccionado;
    if (rolesDisponibles.length === 1) return rolesDisponibles[0];
    return null;
  }, [rolSeleccionado, rolesDisponibles]);
}

export type DescriptorProveedor = Pick<DefinicionProveedor, 'id' | 'titulo' | 'descripcion'>;

export function useProveedoresDisponibles(): DescriptorProveedor[] {
  return useMemo(
    () =>
      proveedoresDisponibles().map(({ id, titulo, descripcion }) => ({ id, titulo, descripcion })),
    [],
  );
}

const SIN_CAPACIDADES: readonly Capacidad[] = [];

// Capacidades del proveedor recordado; con el bypass de desarrollo no hay proveedor y no hay capacidades.
export function useCapacidades(): readonly Capacidad[] {
  const proveedor = useProveedorStore((s) => s.proveedor);
  return useMemo(() => {
    if (AUTH_BYPASS || !proveedor) return SIN_CAPACIDADES;
    const definicion = definicionDe(proveedor);
    return definicion?.disponible ? definicion.capacidades : SIN_CAPACIDADES;
  }, [proveedor]);
}

// Verdadero mientras el proveedor de identidad no restaura la sesión.
export function useIsInitializing(): boolean {
  return useAuthStore((s) => s.isInitializing);
}

export function useUsername(): string {
  return useAuthStore((s) => s.username);
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : '';
}

function nombreDesdeUsuario(username: string): string {
  const primero = username.split(/[._@]/)[0];
  return primero ? primero.charAt(0).toUpperCase() + primero.slice(1) : username;
}

export function useNombreUsuario(): { nombre: string; nombreCompleto: string } {
  const tokenParsed = useAuthStore((s) => s.tokenParsed);
  const username = useUsername();

  return useMemo(() => {
    const givenName = texto(tokenParsed?.['given_name']);
    const name = texto(tokenParsed?.['name']);
    const familyName = texto(tokenParsed?.['family_name']);
    const nombre = givenName || name.split(/\s+/)[0] || nombreDesdeUsuario(username);
    const nombreCompleto = name || [givenName, familyName].filter(Boolean).join(' ') || nombre;
    return { nombre, nombreCompleto };
  }, [tokenParsed, username]);
}
