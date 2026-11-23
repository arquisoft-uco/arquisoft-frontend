import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { restaurarTemporizadores, usarTemporizadoresFalsos } from '../../test-utils/temporizadores';
import { contextoTemporal, TTL_CONTEXTO_CORTO_MS, TTL_CONTEXTO_MS } from './contexto-temporal';

const esquema = z.object({ titulo: z.string() });
const AMBITO = 'user-1|coordinador';
const CLAVE = { tipo: 'ficha', id: 'f-1' };
const CLAVE_STORAGE = 'arquisoft:ctx:ficha:f-1';
const OPCIONES = { esquema, ambito: AMBITO };

function escribirEnvoltorio(parcial: Record<string, unknown> = {}) {
  sessionStorage.setItem(
    CLAVE_STORAGE,
    JSON.stringify({
      v: 1,
      guardadoEn: Date.now(),
      ambito: AMBITO,
      datos: { titulo: 'Ficha' },
      ...parcial,
    }),
  );
}

describe('contextoTemporal', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    restaurarTemporizadores();
  });

  it('guarda y lee el dato con su ámbito, recortando los campos que el esquema no declara', () => {
    // Act
    const guardado = contextoTemporal.guardar(
      CLAVE,
      { titulo: 'Ficha', extra: 'dato-extra' } as { titulo: string },
      OPCIONES,
    );

    // Assert
    expect(guardado).toBe(true);
    expect(contextoTemporal.leer(CLAVE, OPCIONES)).toEqual({ titulo: 'Ficha' });
    expect(sessionStorage.getItem(CLAVE_STORAGE)).not.toContain('dato-extra');
  });

  it('descarta y borra el dato vencido o del futuro, y respeta la vigencia que recibe', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    contextoTemporal.guardar(CLAVE, { titulo: 'Ficha' }, OPCIONES);

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_CORTO_MS);
    const enElLimite = contextoTemporal.leer(CLAVE, { ...OPCIONES, ttlMs: TTL_CONTEXTO_CORTO_MS });
    vi.setSystemTime(Date.now() + 1);
    const vencido = contextoTemporal.leer(CLAVE, { ...OPCIONES, ttlMs: TTL_CONTEXTO_CORTO_MS });

    // Assert
    expect(enElLimite).toEqual({ titulo: 'Ficha' });
    expect(vencido).toBeNull();
    expect(sessionStorage.getItem(CLAVE_STORAGE)).toBeNull();

    // Arrange
    escribirEnvoltorio({ guardadoEn: Date.now() + 60_000 });

    // Act
    const delFuturo = contextoTemporal.leer(CLAVE, OPCIONES);

    // Assert
    expect(delFuturo).toBeNull();
    expect(sessionStorage.getItem(CLAVE_STORAGE)).toBeNull();
  });

  it('usa la vigencia por defecto de 15 minutos cuando no recibe ttlMs', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    contextoTemporal.guardar(CLAVE, { titulo: 'Ficha' }, OPCIONES);

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS);
    const vigente = contextoTemporal.leer(CLAVE, OPCIONES);
    vi.setSystemTime(Date.now() + 1);
    const vencido = contextoTemporal.leer(CLAVE, OPCIONES);

    // Assert
    expect(vigente).toEqual({ titulo: 'Ficha' });
    expect(vencido).toBeNull();
  });

  it('devuelve null y borra la clave con esquema inválido, JSON malformado, versión o ámbito distintos', () => {
    const casos: Array<() => void> = [
      () => escribirEnvoltorio({ datos: { titulo: 5 } }),
      () => escribirEnvoltorio({ ambito: 7 }),
      () => sessionStorage.setItem(CLAVE_STORAGE, '{no es json'),
      () => escribirEnvoltorio({ v: 2 }),
      () => escribirEnvoltorio({ ambito: 'user-2|coordinador' }),
      () => escribirEnvoltorio({ ambito: 'user-1|asesor-ficha' }),
    ];

    for (const preparar of casos) {
      // Arrange
      preparar();

      // Act
      const resultado = contextoTemporal.leer(CLAVE, OPCIONES);

      // Assert
      expect(resultado).toBeNull();
      expect(sessionStorage.getItem(CLAVE_STORAGE)).toBeNull();
    }
  });

  it('lee el dato guardado con otra versión de esquema solo si se pide esa versión', () => {
    // Arrange
    contextoTemporal.guardar(CLAVE, { titulo: 'Ficha' }, { ...OPCIONES, version: 2 });

    // Act
    const conLaVersion = contextoTemporal.leer(CLAVE, { ...OPCIONES, version: 2 });
    const sinLaVersion = contextoTemporal.leer(CLAVE, OPCIONES);

    // Assert
    expect(conLaVersion).toEqual({ titulo: 'Ficha' });
    expect(sinLaVersion).toBeNull();
  });

  it('no lanza cuando el storage no está disponible, falla al leer o la cuota está llena', () => {
    // Arrange
    contextoTemporal.guardar(CLAVE, { titulo: 'Ficha' }, OPCIONES);

    // Act & Assert: cuota llena
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Cuota excedida', 'QuotaExceededError');
    });
    expect(contextoTemporal.guardar(CLAVE, { titulo: 'Otra' }, OPCIONES)).toBe(false);
    setItem.mockRestore();

    // Act & Assert: valor que no valida
    expect(contextoTemporal.guardar(CLAVE, { titulo: 5 } as never, OPCIONES)).toBe(false);

    // Act & Assert: lectura que falla
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(contextoTemporal.leer(CLAVE, OPCIONES)).toBeNull();
    getItem.mockRestore();

    // Act & Assert: sessionStorage inaccesible
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new DOMException('Acceso denegado', 'SecurityError');
    });
    expect(contextoTemporal.guardar(CLAVE, { titulo: 'Ficha' }, OPCIONES)).toBe(false);
    expect(contextoTemporal.leer(CLAVE, OPCIONES)).toBeNull();
    expect(() => contextoTemporal.borrar(CLAVE)).not.toThrow();
    expect(() => contextoTemporal.borrarTodo()).not.toThrow();
  });

  it('borrar quita solo su clave y borrarTodo solo las del prefijo del contexto', () => {
    // Arrange
    contextoTemporal.guardar(CLAVE, { titulo: 'A' }, OPCIONES);
    contextoTemporal.guardar({ tipo: 'proyecto-grado', id: 'p-1' }, { titulo: 'B' }, OPCIONES);
    sessionStorage.setItem('otra-clave', 'intacta');

    // Act
    contextoTemporal.borrar(CLAVE);

    // Assert
    expect(sessionStorage.getItem(CLAVE_STORAGE)).toBeNull();
    expect(sessionStorage.getItem('arquisoft:ctx:proyecto-grado:p-1')).not.toBeNull();

    // Act
    contextoTemporal.borrarTodo();

    // Assert
    expect(sessionStorage.getItem('arquisoft:ctx:proyecto-grado:p-1')).toBeNull();
    expect(sessionStorage.getItem('otra-clave')).toBe('intacta');
  });
});
