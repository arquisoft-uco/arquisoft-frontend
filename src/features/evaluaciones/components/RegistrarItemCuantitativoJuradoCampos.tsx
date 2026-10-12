import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import FormSection from '../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../shared/validation';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';
import type { RegistrarItemCuantitativoJuradoValues as Values } from '../utils/registrar-item-cuantitativo-jurado-schema';
import SelectorCategoriaItemCuantitativoJurado from './SelectorCategoriaItemCuantitativoJurado';

export const ETIQUETAS_CAMPO = {
  nombre: 'Nombre',
  descripcion: 'Descripción',
  categoriaId: 'Categoría',
  valor: 'Valor máximo',
} as const;

interface Props {
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
  controlFormulario: Control<Values>;
  categorias: CategoriaItemCuantitativoJurado[];
  cargandoCategorias: boolean;
}

export default function RegistrarItemCuantitativoJuradoCampos({
  register,
  errors,
  controlFormulario,
  categorias,
  cargandoCategorias,
}: Props) {
  const [nombre, descripcion] = useWatch({
    control: controlFormulario,
    name: ['nombre', 'descripcion'],
  });

  return (
    <FormSection titulo="Datos del ítem">
      <Field
        etiqueta={ETIQUETAS_CAMPO.nombre}
        error={errors.nombre?.message}
        contador={{ actual: nombre.length, max: LIMITES.ITEM_CUANTITATIVO_NOMBRE_MAX }}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            maxLength={LIMITES.ITEM_CUANTITATIVO_NOMBRE_MAX}
            className="field-input"
            {...register('nombre')}
          />
        )}
      </Field>
      <Field
        etiqueta={ETIQUETAS_CAMPO.descripcion}
        error={errors.descripcion?.message}
        contador={{ actual: descripcion.length, max: LIMITES.ITEM_CUANTITATIVO_DESCRIPCION_MAX }}
      >
        {(control) => (
          <textarea
            {...control}
            rows={4}
            maxLength={LIMITES.ITEM_CUANTITATIVO_DESCRIPCION_MAX}
            className="field-input"
            {...register('descripcion')}
          />
        )}
      </Field>
      <SelectorCategoriaItemCuantitativoJurado
        categorias={categorias}
        cargando={cargandoCategorias}
        error={errors.categoriaId?.message}
        registro={register('categoriaId')}
      />
      <Field
        etiqueta={ETIQUETAS_CAMPO.valor}
        ayuda={`Entre ${LIMITES.ITEM_CUANTITATIVO_VALOR_MIN} y ${LIMITES.ITEM_CUANTITATIVO_VALOR_MAX}`}
        error={errors.valor?.message}
        corto
      >
        {(control) => (
          <input
            {...control}
            type="text"
            inputMode="numeric"
            className="field-input"
            {...register('valor')}
          />
        )}
      </Field>
    </FormSection>
  );
}
