import { PDP_CONFIG } from '../../config/env';
import type { DefinicionProveedor, ProveedorId, ProveedorIdentidad } from './proveedor';
import { crearKeycloakProveedor } from './keycloak/keycloakProveedor';
import { crearPdpProveedor } from './pdp/pdpProveedor';

const REGISTRO: DefinicionProveedor[] = [
  {
    id: 'keycloak',
    titulo: 'Keycloak',
    descripcion: 'Inicia sesión con tu cuenta institucional de Arquisoft.',
    capacidades: [],
    disponible: true,
    crear: crearKeycloakProveedor,
  },
  {
    id: 'pdp',
    titulo: 'Security Baseline',
    descripcion: 'Inicia sesión con la plataforma de seguridad y administra los accesos.',
    capacidades: ['administracion-seguridad'],
    disponible: PDP_CONFIG !== null,
    crear: crearPdpProveedor,
  },
];

export function proveedoresDisponibles(): DefinicionProveedor[] {
  return REGISTRO.filter((definicion) => definicion.disponible);
}

export function definicionDe(id: ProveedorId): DefinicionProveedor | undefined {
  return REGISTRO.find((definicion) => definicion.id === id);
}

export function crearProveedor(id: ProveedorId): ProveedorIdentidad {
  const definicion = definicionDe(id);
  if (!definicion) throw new Error(`[auth] Proveedor de identidad desconocido: "${id}".`);
  return definicion.crear();
}
