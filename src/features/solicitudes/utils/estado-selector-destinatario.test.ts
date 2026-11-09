import { describe, it, expect } from 'vitest';
import { estadoSelectorDestinatario } from './estado-selector-destinatario';

describe('estadoSelectorDestinatario', () => {
  it('resuelve el estado con la precedencia cargando, error, vacío y listo', () => {
    // Arrange / Act / Assert
    expect(estadoSelectorDestinatario({ cargando: true, error: true, cantidad: 0 })).toBe(
      'cargando',
    );
    expect(estadoSelectorDestinatario({ cargando: false, error: true, cantidad: 0 })).toBe('error');
    expect(estadoSelectorDestinatario({ cargando: false, error: false, cantidad: 0 })).toBe(
      'vacio',
    );
    expect(estadoSelectorDestinatario({ cargando: false, error: false, cantidad: 2 })).toBe(
      'listo',
    );
  });
});
