import type { FieldValues, Path, UseFormRegister, UseFormReturn } from 'react-hook-form';

type ConPar = FieldValues & { nombres: string; apellidos: string };

const PAR_DE_NOMBRES: Record<string, 'nombres' | 'apellidos' | undefined> = {
  nombres: 'apellidos',
  apellidos: 'nombres',
};

export function useParDeNombres<T extends ConPar>(
  formulario: UseFormReturn<T>,
): UseFormRegister<T> {
  // El otro campo se revalida solo si ya se tocó, para no pintar error en uno aún sin visitar.
  return (nombre, opciones) => {
    const par = PAR_DE_NOMBRES[nombre];
    if (!par) return formulario.register(nombre, opciones);
    const revalidarPar = () => {
      if (formulario.getFieldState(par as Path<T>).isTouched) formulario.trigger(par as Path<T>);
    };
    return formulario.register(nombre, {
      ...opciones,
      onChange: revalidarPar,
      onBlur: revalidarPar,
    });
  };
}
