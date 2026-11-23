import { describe, expect, it } from 'vitest';
import { usosIndebidosDeStorage } from './arquitectura';

describe('usosIndebidosDeStorage', () => {
  it('marca el uso de storage fuera de los dos archivos autorizados y el cruce de storages', () => {
    // Arrange
    const archivos = [
      { ruta: 'features/x/hooks/useX.ts', contenido: 'sessionStorage.getItem("a")' },
      { ruta: 'features/y/hooks/useY.ts', contenido: 'window.localStorage.clear()' },
      { ruta: 'auth/safeStorage.ts', contenido: 'sessionStorage.clear()' },
      { ruta: 'shared/utils/contexto-temporal.ts', contenido: 'localStorage.clear()' },
      { ruta: 'features/z/hooks/useZ.ts', contenido: 'const a = 1;' },
    ];

    // Act
    const usos = usosIndebidosDeStorage(archivos);

    // Assert
    expect(usos).toEqual([
      'features/x/hooks/useX.ts',
      'features/y/hooks/useY.ts',
      'auth/safeStorage.ts',
      'shared/utils/contexto-temporal.ts',
    ]);
  });

  it('acepta los dos archivos autorizados con su storage', () => {
    // Arrange
    const archivos = [
      { ruta: 'auth/safeStorage.ts', contenido: 'localStorage.getItem("a")' },
      { ruta: 'shared/utils/contexto-temporal.ts', contenido: 'sessionStorage.getItem("a")' },
    ];

    // Act / Assert
    expect(usosIndebidosDeStorage(archivos)).toEqual([]);
  });
});
