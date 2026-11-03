import type { Ref } from 'react';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import type { EstudianteAsignable } from '../../models/EstudianteAsignable';

interface Props {
  opciones: EstudianteAsignable[];
  valor: string[];
  onCambiar: (ids: string[]) => void;
  onBlur?: () => void;
  refCampo?: Ref<HTMLInputElement>;
  error?: string;
  deshabilitado?: boolean;
  textoVacio: string;
  placeholder: string;
}

export default function SelectorEstudiantesField({
  opciones,
  valor,
  onCambiar,
  onBlur,
  refCampo,
  error,
  deshabilitado,
  textoVacio,
  placeholder,
}: Props) {
  return (
    <Field etiqueta="Estudiantes" error={error}>
      {(campo) => (
        <Combobox
          {...campo}
          multiple
          ref={refCampo}
          onBlur={onBlur}
          valor={valor}
          onCambiar={onCambiar}
          opciones={opciones.map((e) => ({
            id: e.estudianteId,
            etiqueta: e.nombre,
            descripcion: e.email,
          }))}
          deshabilitado={deshabilitado}
          etiquetaElegidos="Estudiantes elegidos"
          textoVacio={textoVacio}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}
