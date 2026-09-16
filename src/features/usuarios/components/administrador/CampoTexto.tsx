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
      <label htmlFor={id} className="field-label">
        {etiqueta} <span aria-hidden className="text-danger">*</span>
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className="field-input"
        aria-invalid={!!error}
        aria-describedby={error ? idError : undefined}
        {...registro}
      />
      {error && (
        <p id={idError} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
