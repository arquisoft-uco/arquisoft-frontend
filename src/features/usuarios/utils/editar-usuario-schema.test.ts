import { describe, it, expect } from 'vitest';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import { editarUsuarioSchema } from './editar-usuario-schema';
import type { EditarUsuarioValues } from './editar-usuario-schema';

const VALIDO: EditarUsuarioValues = {
  identificador: '1234567890',
  nombres: 'Ana María',
  apellidos: 'Prueba Ejemplo',
  email: 'ana.prueba@example.com',
  contacto: '3001234567',
};

function erroresPorCampo(valores: EditarUsuarioValues): Record<string, string[]> {
  const resultado = editarUsuarioSchema.safeParse(valores);
  const porCampo: Record<string, string[]> = {};
  if (resultado.success) return porCampo;
  for (const { path, message } of resultado.error.issues) {
    const campo = path.join('.');
    porCampo[campo] = [...(porCampo[campo] ?? []), message];
  }
  return porCampo;
}

describe('editarUsuarioSchema', () => {
  it('acepta un usuario válido y exige nombres y apellidos no vacíos', () => {
    // Act
    const errores = erroresPorCampo({ ...VALIDO, nombres: '', apellidos: '   ' });

    // Assert
    expect(editarUsuarioSchema.safeParse(VALIDO).success).toBe(true);
    expect(errores.nombres).toContain(MENSAJES_VALIDACION.requerido);
    expect(errores.apellidos).toContain(MENSAJES_VALIDACION.requerido);
  });

  it('marca ambos campos si el compuesto pasa del máximo y solo el culpable si el formato falla', () => {
    // Arrange
    const mensaje = MENSAJES_VALIDACION.longitudEntre(
      LIMITES.USUARIO_NOMBRE_MIN,
      LIMITES.USUARIO_NOMBRE_MAX,
    );

    // Act
    const largo = erroresPorCampo({
      ...VALIDO,
      nombres: 'a'.repeat(LIMITES.USUARIO_NOMBRE_MAX),
      apellidos: 'b',
    });
    const formato = erroresPorCampo({ ...VALIDO, apellidos: 'Pérez_' });

    // Assert
    expect(largo).toEqual({ nombres: [mensaje], apellidos: [mensaje] });
    expect(formato).toEqual({ apellidos: [MENSAJES_VALIDACION.formatoNombre] });
  });
});
