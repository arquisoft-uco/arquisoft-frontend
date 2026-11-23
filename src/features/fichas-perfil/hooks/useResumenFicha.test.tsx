import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router';
import { act, renderHook } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import {
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../test-utils/temporizadores';
import { TTL_CONTEXTO_CORTO_MS, TTL_CONTEXTO_MS } from '../../../shared/utils/contexto-temporal';
import { useResumenFicha } from './useResumenFicha';

function crearWrapper(state?: unknown) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[{ pathname: '/fichas-perfil/f-1/items', state }]}>
        {children}
      </MemoryRouter>
    );
  };
}

function renderizar(state?: unknown, ttlMs?: number) {
  return renderHook(() => ({ detalle: useResumenFicha('f-1', ttlMs), navigate: useNavigate() }), {
    wrapper: crearWrapper(state),
  });
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha de prueba',
  estadoId: 'e-1',
  estadoNombre: 'Aprobada',
  fechaActualizacion: '2026-10-02T10:00:00Z',
  asesorId: 'a-9',
  asesorNombre: 'Ana Gómez',
  asesorEmail: 'ana@uco.edu.co',
};

describe('useResumenFicha', () => {
  beforeEach(() => {
    resetAllStores();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('lee el resumen y la search del state y los conserva cuando el state se pierde al cambiar de pestaña', () => {
    // Arrange
    const { result } = renderizar({ resumen: RESUMEN, search: '?q=ana&pagina=2' });
    expect(result.current.detalle.resumen).toEqual(RESUMEN);
    expect(result.current.detalle.search).toBe('?q=ana&pagina=2');

    // Act
    act(() => result.current.navigate('/fichas-perfil/f-1/estados'));

    // Assert
    expect(result.current.detalle.resumen).toEqual(RESUMEN);
    expect(result.current.detalle.search).toBe('?q=ana&pagina=2');
  });

  it('sin state ni snapshot devuelve resumen nulo y search vacía', () => {
    // Act
    const { result } = renderizar();

    // Assert
    expect(result.current.detalle.resumen).toBeNull();
    expect(result.current.detalle.search).toBe('');
  });

  it('sin state recupera del snapshot que escribió el state, con nombre y correo del asesor y sin token ni claims', () => {
    // Arrange
    renderizar({ resumen: RESUMEN, search: '?q=ana' }).unmount();

    // Act
    const { result } = renderizar();

    // Assert
    expect(result.current.detalle.resumen).toEqual(RESUMEN);
    expect(result.current.detalle.search).toBe('?q=ana');
    const guardado = sessionStorage.getItem('arquisoft:ctx:ficha:f-1') ?? '';
    expect(guardado).toContain('a-9');
    expect(guardado).toContain('Ana Gómez');
    expect(guardado).toContain('ana@uco.edu.co');
    expect(guardado).not.toMatch(/token|claims|telefono/i);
  });

  it('lee un snapshot escrito sin nombre ni correo del asesor, como los anteriores al ajuste', () => {
    // Arrange
    const sinPersonal = { id: 'f-1', titulo: 'Ficha de prueba', asesorId: 'a-9' };
    renderizar({ resumen: sinPersonal, search: '?q=a' }).unmount();

    // Act
    const { result } = renderizar();

    // Assert
    expect(result.current.detalle.resumen).toMatchObject(sinPersonal);
    expect(result.current.detalle.resumen?.asesorNombre).toBeUndefined();
    expect(result.current.detalle.search).toBe('?q=a');
  });

  it('descarta el snapshot que supera la vigencia por defecto', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    renderizar({ resumen: RESUMEN, search: '' }).unmount();

    // Act
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_MS + 1000);
    const { result } = renderizar();

    // Assert
    expect(result.current.detalle.resumen).toBeNull();
  });

  it('aplica la vigencia corta que recibe: vigente con la de por defecto, vencido con la corta', () => {
    // Arrange
    usarTemporizadoresFalsos();
    vi.setSystemTime(new Date('2026-11-23T10:00:00Z'));
    renderizar({ resumen: RESUMEN, search: '' }).unmount();
    vi.setSystemTime(Date.now() + TTL_CONTEXTO_CORTO_MS + 1000);

    // Act
    const porDefecto = renderizar();
    porDefecto.unmount();
    const corto = renderizar(undefined, TTL_CONTEXTO_CORTO_MS);

    // Assert
    expect(porDefecto.result.current.detalle.resumen).not.toBeNull();
    expect(corto.result.current.detalle.resumen).toBeNull();
  });

  it('actualizarResumen cambia el resumen en memoria y reescribe el snapshot', () => {
    // Arrange
    const { result } = renderizar({ resumen: RESUMEN, search: '' });

    // Act
    act(() => result.current.detalle.actualizarResumen({ estadoId: 'e-2', estadoNombre: 'Nueva' }));
    const recargada = renderizar();

    // Assert
    expect(result.current.detalle.resumen).toMatchObject({ estadoId: 'e-2', asesorId: 'a-9' });
    expect(recargada.result.current.detalle.resumen).toMatchObject({
      estadoId: 'e-2',
      estadoNombre: 'Nueva',
      asesorNombre: 'Ana Gómez',
      asesorEmail: 'ana@uco.edu.co',
    });
  });

  it('ignora un state de otra ficha o malformado', () => {
    // Act
    const ajeno = renderizar({ resumen: { ...RESUMEN, id: 'otra' }, search: '' });
    const sinSearch = renderizar({ resumen: RESUMEN });
    const sinTitulo = renderizar({ resumen: { id: 'f-1' }, search: '' });
    const cadena = renderizar('texto');

    // Assert
    for (const { result } of [ajeno, sinSearch, sinTitulo, cadena]) {
      expect(result.current.detalle.resumen).toBeNull();
      expect(result.current.detalle.search).toBe('');
    }
  });

  it('descarta los campos opcionales que no son cadenas', () => {
    // Act
    const { result } = renderizar({
      resumen: { id: 'f-1', titulo: 'T', estadoId: 5, asesorNombre: null },
      search: '',
    });

    // Assert
    expect(result.current.detalle.resumen).toEqual({
      id: 'f-1',
      titulo: 'T',
      estadoId: undefined,
      estadoNombre: undefined,
      fechaActualizacion: undefined,
      asesorId: undefined,
      asesorNombre: undefined,
      asesorEmail: undefined,
    });
  });

  it('lee el origen válido del state y ignora uno malformado sin perder resumen ni search', () => {
    // Arrange
    const origen = { etiqueta: 'Proyectos de grado', to: '/proyectos-grado' };

    // Act
    const valido = renderizar({ resumen: RESUMEN, search: '?q=a', origen });
    const invalidos = [
      { to: '/proyectos-grado' },
      { etiqueta: '', to: '/proyectos-grado' },
      { etiqueta: 'Externo', to: '//malo.com' },
      { etiqueta: 'Externo', to: 'https://malo.com' },
    ].map((origenInvalido) =>
      renderizar({ resumen: RESUMEN, search: '?q=a', origen: origenInvalido }),
    );

    // Assert
    expect(valido.result.current.detalle.origen).toEqual(origen);
    for (const { result } of invalidos) {
      expect(result.current.detalle.origen).toBeUndefined();
      expect(result.current.detalle.resumen).toEqual(RESUMEN);
      expect(result.current.detalle.search).toBe('?q=a');
    }
  });
});
