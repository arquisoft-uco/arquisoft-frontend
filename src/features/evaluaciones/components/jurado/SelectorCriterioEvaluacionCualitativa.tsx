import { Controller, type Control } from 'react-hook-form';
import Combobox from '../../../../shared/components/ui/Combobox';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Field from '../../../../shared/components/ui/Field';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { CriterioItemCualitativoJurado } from '../../models/CriterioItemCualitativoJurado';
import type { CambiarCriterioEvaluacionCualitativaJuradoValues } from '../../utils/cambiar-criterio-evaluacion-cualitativa-jurado-schema';

export function EstadoCatalogoCriterios({
  cargando,
  onReintentar,
}: {
  cargando: boolean;
  onReintentar: () => void;
}) {
  if (cargando) return <Skeleton variante="formulario" etiqueta="Cargando criterios" />;
  return (
    <ErrorState
      titulo="No se pudieron cargar los criterios"
      descripcion="Inténtalo nuevamente."
      onReintentar={onReintentar}
    />
  );
}

interface Props {
  control: Control<CambiarCriterioEvaluacionCualitativaJuradoValues>;
  criterios: CriterioItemCualitativoJurado[];
  criterioActual: string;
  error?: string;
  deshabilitado?: boolean;
}

export default function SelectorCriterioEvaluacionCualitativa({
  control,
  criterios,
  criterioActual,
  error,
  deshabilitado,
}: Props) {
  return (
    <Field etiqueta="Criterio" ayuda={`Criterio actual: ${criterioActual}`} error={error}>
      {(campo) => (
        <Controller
          name="criterioId"
          control={control}
          render={({ field }) => (
            <Combobox
              {...campo}
              opciones={criterios.map(({ id, nombre, descripcion }) => ({
                id,
                etiqueta: nombre,
                descripcion,
              }))}
              valor={field.value}
              onCambiar={field.onChange}
              textoVacio="No hay criterios que coincidan."
              etiquetaElegidos="Criterio elegido"
              placeholder="Busca un criterio"
              deshabilitado={deshabilitado}
            />
          )}
        />
      )}
    </Field>
  );
}
