import { beforeEach, describe, expect, it } from 'vitest';
import { useProveedorStore } from './proveedorStore';

describe('useProveedorStore', () => {
  beforeEach(() => {
    useProveedorStore.setState({ proveedor: null });
  });

  it('elige y limpia el proveedor, y solo persiste el id', () => {
    // Act
    useProveedorStore.getState().elegirProveedor('pdp');
    const tras = useProveedorStore.getState().proveedor;
    const persistido = useProveedorStore.persist
      .getOptions()
      .partialize?.(useProveedorStore.getState());
    useProveedorStore.getState().limpiarProveedor();

    // Assert
    expect(tras).toBe('pdp');
    expect(persistido).toEqual({ proveedor: 'pdp' });
    expect(useProveedorStore.getState().proveedor).toBeNull();
  });
});
