import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { z } from 'zod';
import { act, renderHook } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { restaurarTemporizadores, usarTemporizadoresFalsos } from '../../test-utils/temporizadores';
import { Rol } from '../models/rol';
import { contextoTemporal, TTL_CONTEXTO_MS } from '../utils/contexto-temporal';
import { useContextoDeNavegacion } from './useContextoDeNavegacion';

const esquema = z.object({ id: z.string(), nota: z.string() });
const VALIDO = { id: 'd-1', nota: 'inicial' };

function montar(state?: unknown, coincide?: (valor: z.infer<typeof esquema>) => boolean) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[{ pathname: '/demo/d-1', state }]}>{children}</MemoryRouter>
  );
  return renderHook(
    () =>
      useContextoDeNavegacion({
        tipo: 'demo',
        id: 'd-1',
        esquemaEstado: esquema,
        coincide,
      }),
    { wrapper },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({
    tokenParsed: { sub: 'u-1', realm_access: { roles: [Rol.Coordinador, Rol.Asesor] } },
  });
  setActiveRole(rol);
}

describe('useContextoDeNavegacion', () => {
  beforeEach(() => {
    resetAllStores();
    entrarComo(Rol.Coordinador);
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('el state válido gana y se persiste recortado como snapshot; uno inválido no se persiste', () => {
    // Arrange
    const conState = montar({ ...VALIDO, extra: 'se recorta' });
    conState.unmount();

    // Act
    const sinState = montar();
    const guardado = sessionStorage.getItem('arquisoft:ctx:demo:d-1');
    sessionStorage.clear();
    const invalido = montar({ id: 5 });

    // Assert
    expect(conState.result.current.contexto).toEqual(VALIDO);
    expect(sinState.result.current.contexto).toEqual(VALIDO);
    expect(guardado).not.toContain('se recorta');
    expect(invalido.result.current.contexto).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('solo escribe el snapshot cuando el contexto vino por state: la vigencia no se extiende por mirarlo', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    montar(VALIDO).unmount();

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS - 1000);
    const dentro = montar();
    dentro.unmount();
    vi.setSystemTime(Date.now() + 2000);
    const vencido = montar();

    // Assert
    expect(dentro.result.current.contexto).toEqual(VALIDO);
    expect(vencido.result.current.contexto).toBeNull();
  });

  it('sin state ni snapshot devuelve null y no escribe nada', () => {
    // Act
    const { result } = montar();

    // Assert
    expect(result.current.contexto).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('actualizar cambia el contexto, reescribe el snapshot con marca nueva y sin contexto no hace nada', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    const { result, unmount } = montar(VALIDO);

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS - 1000);
    act(() => result.current.actualizar((previo) => ({ ...previo, nota: 'cambiada' })));
    unmount();
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS - 1000);
    const recuperado = montar();
    recuperado.unmount();
    sessionStorage.clear();
    const vacio = montar();
    act(() => vacio.result.current.actualizar((previo) => ({ ...previo, nota: 'x' })));

    // Assert
    expect(result.current.contexto).toEqual({ ...VALIDO, nota: 'cambiada' });
    expect(recuperado.result.current.contexto).toEqual({ ...VALIDO, nota: 'cambiada' });
    expect(vacio.result.current.contexto).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('ignora el state y el snapshot que no coinciden, y el snapshot que se vio con otro rol', () => {
    // Arrange
    const ajeno = montar({ id: 'otro', nota: 'x' }, (valor) => valor.id === 'd-1');
    expect(ajeno.result.current.contexto).toBeNull();
    ajeno.unmount();
    montar(VALIDO).unmount();

    // Act
    const noCoincide = montar(undefined, (valor) => valor.id === 'otro');
    entrarComo(Rol.Asesor);
    const otroRol = montar();

    // Assert
    expect(noCoincide.result.current.contexto).toBeNull();
    expect(otroRol.result.current.contexto).toBeNull();
  });

  it('guarda con el ámbito de usuario y rol que lee del contexto de sesión', () => {
    // Arrange
    montar(VALIDO).unmount();

    // Act
    const mismoAmbito = contextoTemporal.leer(
      { tipo: 'demo', id: 'd-1' },
      { esquema, ambito: 'u-1|coordinador' },
    );

    // Assert
    expect(mismoAmbito).toEqual(VALIDO);
  });
});
