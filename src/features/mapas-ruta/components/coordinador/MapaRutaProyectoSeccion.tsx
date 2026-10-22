import { useEffect, useRef } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { Map } from 'lucide-react';
import Combobox from '../../../../shared/components/ui/Combobox';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { useProyectosElegibles } from '../../hooks/useProyectosElegibles';
import type { RegistrarMapaRutaValues } from '../../hooks/useRegistrarMapaRutaForm';

interface Props {
  control: Control<RegistrarMapaRutaValues>;
  catalogo: ReturnType<typeof useProyectosElegibles>;
}

export default function MapaRutaProyectoSeccion({ control, catalogo }: Props) {
  const { proyectos, isLoading, isError, error, refetch, hayMas, cargandoMas, cargarMas } =
    catalogo;
  const errorAvisado = useRef<unknown>(null);

  useEffect(() => {
    if (!isError || proyectos.length === 0 || errorAvisado.current === error) return;
    errorAvisado.current = error;
    toast.error(
      'No se pudieron cargar más proyectos',
      getApiErrorMessage(error, 'Inténtalo nuevamente.'),
    );
  }, [isError, proyectos.length, error]);

  const opciones = proyectos.map((p) => ({ id: p.id, etiqueta: p.titulo }));

  return (
    <FormSection titulo="Proyecto">
      {isLoading && <Skeleton variante="lineas" etiqueta="Cargando proyectos…" />}
      {isError && proyectos.length === 0 && (
        <ErrorState
          titulo="No se pudieron cargar los proyectos"
          detalle={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      )}
      {!isLoading && !isError && proyectos.length === 0 && (
        <EmptyState
          icono={Map}
          titulo="No tienes proyectos en proceso"
          descripcion="Cuando un proyecto esté en proceso podrás crear su mapa de ruta."
        />
      )}
      {proyectos.length > 0 && (
        <Controller
          name="proyectoGrado"
          control={control}
          render={({ field, fieldState }) => (
            <Field etiqueta="Proyecto" error={fieldState.error?.message}>
              {(campo) => (
                <Combobox
                  {...campo}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={field.onChange}
                  opciones={opciones}
                  etiquetaElegidos="Proyecto elegido"
                  textoVacio="No hay proyectos que coincidan."
                  placeholder="Busca por título"
                  cargarMas={
                    hayMas
                      ? {
                          etiqueta: 'Cargar más proyectos',
                          cargando: cargandoMas,
                          onCargar: () => void cargarMas(),
                        }
                      : undefined
                  }
                />
              )}
            </Field>
          )}
        />
      )}
    </FormSection>
  );
}
