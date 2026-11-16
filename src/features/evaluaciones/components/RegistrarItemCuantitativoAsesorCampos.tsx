import { useWatch } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import FormSection from '../../../shared/components/ui/FormSection';
import { LIMITES } from '../../../shared/validation';
import type { CategoriaItemCuantitativoAsesor } from '../models/CategoriaItemCuantitativoAsesor';
import type { RegistrarItemCuantitativoAsesorValues as Values } from '../utils/registrar-item-cuantitativo-asesor-schema';
import SelectorCategoriaItemCuantitativo from './SelectorCategoriaItemCuantitativo';

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
  categorias: CategoriaItemCuantitativoAsesor[];
  cargandoCategorias: boolean;
}

export default function RegistrarItemCuantitativoAsesorCampos({
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
        contador={{ actual: nombre.length, max: LIMITES.ITEM_CUANTITATIVO_ASESOR_NOMBRE_MAX }}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            maxLength={LIMITES.ITEM_CUANTITATIVO_ASESOR_NOMBRE_MAX}
            className="field-input"
            {...register('nombre')}
          />
        )}
      </Field>
      <Field
        etiqueta={ETIQUETAS_CAMPO.descripcion}
        error={errors.descripcion?.message}
        contador={{
          actual: descripcion.length,
          max: LIMITES.ITEM_CUANTITATIVO_ASESOR_DESCRIPCION_MAX,
        }}
      >
        {(control) => (
          <textarea
            {...control}
            rows={4}
            maxLength={LIMITES.ITEM_CUANTITATIVO_ASESOR_DESCRIPCION_MAX}
            className="field-input"
            {...register('descripcion')}
          />
        )}
      </Field>
      <SelectorCategoriaItemCuantitativo
        categorias={categorias}
        cargando={cargandoCategorias}
        error={errors.categoriaId?.message}
        registro={register('categoriaId')}
      />
      <Field
        etiqueta={ETIQUETAS_CAMPO.valor}
        ayuda={`Entre ${LIMITES.ITEM_CUANTITATIVO_ASESOR_VALOR_MIN} y ${LIMITES.ITEM_CUANTITATIVO_ASESOR_VALOR_MAX}`}
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
