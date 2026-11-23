import { z } from 'zod';
import type { ZodType } from 'zod';

export const TTL_CONTEXTO_MS = 15 * 60 * 1000;
export const TTL_CONTEXTO_CORTO_MS = 5 * 60 * 1000;

const PREFIJO = 'arquisoft:ctx:';
const VERSION_POR_DEFECTO = 1;

export interface ClaveContexto {
  tipo: string;
  id: string;
}

interface OpcionesGuardar<T> {
  esquema: ZodType<T, z.ZodTypeDef, unknown>;
  ambito: string;
  version?: number;
}

interface OpcionesLeer<T> extends OpcionesGuardar<T> {
  ttlMs?: number;
}

const esquemaEnvoltorio = z.object({
  v: z.number(),
  guardadoEn: z.number(),
  ambito: z.string(),
  datos: z.unknown(),
});

function ahora(): number {
  return Date.now();
}

function almacen(): Storage | null {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
}

function claveDe({ tipo, id }: ClaveContexto): string {
  return `${PREFIJO}${tipo}:${id}`;
}

function borrar(clave: ClaveContexto): void {
  try {
    almacen()?.removeItem(claveDe(clave));
  } catch {
    // Sin storage no hay nada que borrar.
  }
}

function guardar<T>(clave: ClaveContexto, valor: T, opciones: OpcionesGuardar<T>): boolean {
  try {
    const storage = almacen();
    if (!storage) return false;
    const datos = opciones.esquema.parse(valor);
    const envoltorio = {
      v: opciones.version ?? VERSION_POR_DEFECTO,
      guardadoEn: ahora(),
      ambito: opciones.ambito,
      datos,
    };
    storage.setItem(claveDe(clave), JSON.stringify(envoltorio));
    return true;
  } catch {
    return false;
  }
}

function leer<T>(clave: ClaveContexto, opciones: OpcionesLeer<T>): T | null {
  try {
    const storage = almacen();
    if (!storage) return null;
    const crudo = storage.getItem(claveDe(clave));
    if (crudo === null) return null;

    const envoltorio = esquemaEnvoltorio.safeParse(JSON.parse(crudo));
    const ttl = opciones.ttlMs ?? TTL_CONTEXTO_MS;
    const transcurrido = envoltorio.success ? ahora() - envoltorio.data.guardadoEn : 0;
    const vigente =
      envoltorio.success &&
      envoltorio.data.v === (opciones.version ?? VERSION_POR_DEFECTO) &&
      envoltorio.data.ambito === opciones.ambito &&
      transcurrido >= 0 &&
      transcurrido <= ttl;
    if (!vigente) {
      borrar(clave);
      return null;
    }

    const datos = opciones.esquema.safeParse(envoltorio.data.datos);
    if (!datos.success) {
      borrar(clave);
      return null;
    }
    return datos.data;
  } catch {
    borrar(clave);
    return null;
  }
}

function borrarTodo(): void {
  try {
    const storage = almacen();
    if (!storage) return;
    const claves: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const clave = storage.key(i);
      if (clave?.startsWith(PREFIJO)) claves.push(clave);
    }
    claves.forEach((clave) => storage.removeItem(clave));
  } catch {
    // Sin storage no hay nada que borrar.
  }
}

export const contextoTemporal = { guardar, leer, borrar, borrarTodo } as const;
