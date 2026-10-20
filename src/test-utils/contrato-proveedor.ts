import { describe, expect, it, vi } from 'vitest';
import type { ProveedorIdentidad } from '../auth/proveedores/proveedor';
import { definicionDe } from '../auth/proveedores/proveedores';

export interface EscenariosProveedor {
  crear: () => ProveedorIdentidad;
  conSesion: () => void;
  sinSesion: () => void;
  conFallo: () => void;
  verificarLoginEnCurso: () => void;
  prepararRenovacion: () => void;
  verificarCierre: () => void;
  provocarRenovacionDeSesion?: () => Promise<void> | void;
}

// Un proveedor nuevo solo aporta su archivo de escenarios: las reglas del contrato son estas.
export function describirContratoProveedor(nombre: string, escenarios: EscenariosProveedor) {
  describe(`contrato ProveedorIdentidad: ${nombre}`, () => {
    it('su id coincide con el de su definición en el registro', () => {
      const proveedor = escenarios.crear();

      expect(definicionDe(proveedor.id)?.id).toBe(proveedor.id);
    });

    it('con sesión devuelve la sesión restaurada con claims y nombre de usuario', async () => {
      // Arrange
      escenarios.conSesion();
      const proveedor = escenarios.crear();

      // Act
      const sesion = await proveedor.restaurarSesion(vi.fn());

      // Assert
      expect(sesion?.tokenParsed).toBeDefined();
      expect(sesion?.username).toEqual(expect.any(String));
      expect(sesion?.username).not.toBe('');
    });

    it('sin sesión devuelve null y deja el inicio de sesión en curso', async () => {
      // Arrange
      escenarios.sinSesion();
      const proveedor = escenarios.crear();

      // Act
      const sesion = await proveedor.restaurarSesion(vi.fn());

      // Assert
      expect(sesion).toBeNull();
      escenarios.verificarLoginEnCurso();
    });

    it('un fallo no recuperable rechaza la restauración', async () => {
      // Arrange
      escenarios.conFallo();
      const proveedor = escenarios.crear();

      // Act / Assert
      await expect(proveedor.restaurarSesion(vi.fn())).rejects.toThrow();
    });

    it('entrega credenciales HTTP como objeto y la renovación responde un booleano', async () => {
      // Arrange
      escenarios.prepararRenovacion();
      const proveedor = escenarios.crear();

      // Act
      const credenciales = proveedor.credencialesHttp();
      const renovada = await proveedor.renovarSesion();

      // Assert
      expect(credenciales).toEqual(expect.any(Object));
      expect(typeof renovada).toBe('boolean');
    });

    it('cerrarSesion se resuelve y ejecuta el cierre propio del proveedor', async () => {
      // Arrange
      const proveedor = escenarios.crear();

      // Act
      await proveedor.cerrarSesion('http://app.test');

      // Assert
      escenarios.verificarCierre();
    });

    if (escenarios.provocarRenovacionDeSesion) {
      it('avisa por alActualizar cuando la sesión se renueva por su cuenta', async () => {
        // Arrange
        escenarios.conSesion();
        const alActualizar = vi.fn();
        await escenarios.crear().restaurarSesion(alActualizar);

        // Act
        await escenarios.provocarRenovacionDeSesion?.();

        // Assert
        expect(alActualizar).toHaveBeenCalledTimes(1);
      });
    }
  });
}
