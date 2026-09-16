import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface Props {
  id: string;
  etiqueta: string;
  registro: UseFormRegisterReturn;
  error?: string;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
}

export default function CampoTexto({
  id,
  etiqueta,
  registro,
  error,
  type = 'text',
  inputMode,
}: Props) {
  const idError = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-on-surface-secondary">
        {etiqueta} <span aria-hidden className="text-danger">*</span>
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-on-surface outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-danger sm:py-2 sm:text-sm"
        aria-invalid={!!error}
        aria-describedby={error ? idError : undefined}
        {...registro}
      />
      {error && (
        <p id={idError} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
