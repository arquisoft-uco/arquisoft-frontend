import { beforeEach, describe, expect, it } from 'vitest';
import { useProveedorStore } from './proveedorStore';

describe('useProveedorStore', () => {
  beforeEach(() => {
    useProveedorStore.setState({ proveedor: null, confirmadoEnEstaCarga: false });
  });

  it('elige y limpia el proveedor y su confirmación en esta carga, y solo persiste el id', () => {
    // Act
    useProveedorStore.getState().elegirProveedor('pdp');
    const tras = useProveedorStore.getState().proveedor;
    const confirmado = useProveedorStore.getState().confirmadoEnEstaCarga;
    const persistido = useProveedorStore.persist
      .getOptions()
      .partialize?.(useProveedorStore.getState());
    useProveedorStore.getState().limpiarProveedor();

    // Assert
    expect(tras).toBe('pdp');
    expect(confirmado).toBe(true);
    expect(useProveedorStore.getState().confirmadoEnEstaCarga).toBe(false);
    expect(persistido).toEqual({ proveedor: 'pdp' });
    expect(useProveedorStore.getState().proveedor).toBeNull();
  });
});
