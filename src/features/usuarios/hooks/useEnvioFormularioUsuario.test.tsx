import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { toast } from '../../../shared/hooks/useToast';
import { errorApi } from '../../../test-utils/errores-api';
import { useEnvioFormularioUsuario } from './useEnvioFormularioUsuario';

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface Valores {
  email: string;
  nombre: string;
}

const CAMPOS = ['email', 'nombre'] as const;

function montar(alias?: Record<string, readonly ('email' | 'nombre')[]>) {
  const reiniciarMutacion = vi.fn();
  const onCerrar = vi.fn();
  const resultado = renderHook(() => {
    const formulario = useForm<Valores>({ defaultValues: { email: '', nombre: '' } });
    const envio = useEnvioFormularioUsuario({
      formulario,
      campos: CAMPOS,
      reiniciarMutacion,
      onCerrar,
      alias,
    });
    const { errors } = formulario.formState;
    return { formulario, envio, errors };
  });
  return { ...resultado, reiniciarMutacion, onCerrar };
}

describe('useEnvioFormularioUsuario', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it('el resumen de errores está oculto al inicio y alInvalido lo muestra', () => {
    // Arrange
    const { result } = montar();

    // Assert
    expect(result.current.envio.resumenVisible).toBe(false);

    // Act
    act(() => result.current.envio.alInvalido());

    // Assert
    expect(result.current.envio.resumenVisible).toBe(true);
  });

  it('irAlCampo enfoca solo un campo conocido', () => {
    // Arrange
    const { result } = montar();
    const setFocus = vi.spyOn(result.current.formulario, 'setFocus');

    // Act
    act(() => result.current.envio.irAlCampo('email'));
    act(() => result.current.envio.irAlCampo('desconocido'));

    // Assert
    expect(setFocus).toHaveBeenCalledTimes(1);
    expect(setFocus).toHaveBeenCalledWith('email');
  });

  it('alErrorDeApi avisa con toast.error, pinta el error en el campo y muestra el resumen', () => {
    // Arrange
    const { result } = montar();
    const err = errorApi(422, {
      message: 'Ya existe un usuario con este correo.',
      errorCode: 'USUARIO_EMAIL_DUPLICADO',
    });

    // Act
    act(() => result.current.envio.alErrorDeApi(err, 'No se pudo registrar'));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar',
      'Ya existe un usuario con este correo.',
    );
    expect(result.current.errors.email?.message).toBe('Ya existe un usuario con este correo.');
    expect(result.current.envio.resumenVisible).toBe(true);
  });

  it('alErrorDeApi pinta un campo del backend en todos los inputs de su alias', () => {
    // Arrange
    const { result } = montar({ nombre: ['email', 'nombre'] });
    const err = errorApi(422, {
      message: 'Nombre no válido.',
      fieldErrors: [{ field: 'nombre', message: 'Nombre no válido.' }],
    });

    // Act
    act(() => result.current.envio.alErrorDeApi(err, 'No se pudo registrar'));

    // Assert
    expect(result.current.errors.email?.message).toBe('Nombre no válido.');
    expect(result.current.errors.nombre?.message).toBe('Nombre no válido.');
  });

  it('cerrar reinicia el formulario y la mutación y llama a onCerrar', () => {
    // Arrange
    const { result, reiniciarMutacion, onCerrar } = montar();
    act(() => result.current.formulario.setValue('email', 'a@b.co', { shouldDirty: true }));

    // Act
    act(() => result.current.envio.cerrar());

    // Assert
    expect(result.current.formulario.getValues('email')).toBe('');
    expect(reiniciarMutacion).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
