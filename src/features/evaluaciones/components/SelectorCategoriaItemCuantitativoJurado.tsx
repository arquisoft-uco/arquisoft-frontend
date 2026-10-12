import type { UseFormRegisterReturn } from 'react-hook-form';
import Field from '../../../shared/components/ui/Field';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';

interface Props {
  categorias: CategoriaItemCuantitativoJurado[];
  cargando: boolean;
  error?: string;
  registro: UseFormRegisterReturn;
}

function textoOpcionInicial(cargando: boolean, hayCategorias: boolean) {
  if (cargando) return 'Cargando categorías…';
  return hayCategorias ? 'Selecciona una categoría' : 'No hay categorías disponibles';
}

export default function SelectorCategoriaItemCuantitativoJurado({
  categorias,
  cargando,
  error,
  registro,
}: Props) {
  return (
    <Field etiqueta="Categoría" error={error}>
      {(control) => (
        <select className="field-input" aria-busy={cargando} {...registro} {...control}>
          <option value="">{textoOpcionInicial(cargando, categorias.length > 0)}</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
