import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { registrarUsuarioSchema } from './registrar-usuario-schema';
import type { RegistrarUsuarioValues } from './registrar-usuario-schema';

const REGISTRO_VALIDO: RegistrarUsuarioValues = {
  identificador: '1234567890',
  nombres: 'Ana María',
  apellidos: 'Prueba Ejemplo',
  email: 'ana.prueba@example.com',
  contacto: '3001234567',
};

function erroresPorCampo(valores: RegistrarUsuarioValues): Record<string, string[]> {
  const resultado = registrarUsuarioSchema.safeParse(valores);
  const porCampo: Record<string, string[]> = {};
  if (resultado.success) return porCampo;
  for (const { path, message } of resultado.error.issues) {
    const campo = path.join('.');
    porCampo[campo] = [...(porCampo[campo] ?? []), message];
  }
  return porCampo;
}

describe('registrarUsuarioSchema', () => {
  it('marca nombres y apellidos cuando juntos pasan del máximo aunque cada uno tenga formato válido, y deja de marcarlos al corregir uno solo', () => {
    // Arrange
    const mensaje = MENSAJES_VALIDACION.longitudEntre(
      LIMITES.USUARIO_NOMBRE_MIN,
      LIMITES.USUARIO_NOMBRE_MAX,
    );
    const nombres = 'a'.repeat(40);
    const apellidosEnElLimite = 'b'.repeat(LIMITES.USUARIO_NOMBRE_MAX - nombres.length - 1);
    const apellidosExcedidos = `${apellidosEnElLimite}b`;

    // Act
    const sinCorregir = erroresPorCampo({
      ...REGISTRO_VALIDO,
      nombres,
      apellidos: apellidosExcedidos,
    });
    const corrigiendoSoloApellidos = erroresPorCampo({
      ...REGISTRO_VALIDO,
      nombres,
      apellidos: apellidosEnElLimite,
    });
    const corrigiendoSoloNombres = erroresPorCampo({
      ...REGISTRO_VALIDO,
      nombres: nombres.slice(1),
      apellidos: apellidosExcedidos,
    });

    // Assert
    expect(sinCorregir).toEqual({ nombres: [mensaje], apellidos: [mensaje] });
    expect(corrigiendoSoloApellidos).toEqual({});
    expect(corrigiendoSoloNombres).toEqual({});
  });

  it('pinta el error de formato solo en el campo culpable y deja pasar un registro válido', () => {
    // Act
    const conNombresInvalidos = erroresPorCampo({ ...REGISTRO_VALIDO, nombres: 'Juan1' });
    const conApellidosInvalidos = erroresPorCampo({ ...REGISTRO_VALIDO, apellidos: 'Pérez_' });

    // Assert
    expect(conNombresInvalidos).toEqual({ nombres: [MENSAJES_VALIDACION.formatoNombre] });
    expect(conApellidosInvalidos).toEqual({ apellidos: [MENSAJES_VALIDACION.formatoNombre] });
    expect(registrarUsuarioSchema.safeParse(REGISTRO_VALIDO).success).toBe(true);
  });
});
