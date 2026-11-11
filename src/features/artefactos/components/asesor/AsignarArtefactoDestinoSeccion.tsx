import { Controller, type Control } from 'react-hook-form';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { useProyectosAsesorCatalogo } from '../../hooks/useProyectosAsesorCatalogo';
import type { useVersionesRepositorioCatalogo } from '../../hooks/useVersionesRepositorioCatalogo';
import type { AsignarArtefactoValues } from '../../utils/asignar-artefacto-schema';

const AYUDA_VERSION =
  'Si el proyecto tiene un artefacto omitido de este repositorio, se reactiva conservando su versión original y quedan solo los estudiantes que elijas.';

interface Props {
  control: Control<AsignarArtefactoValues>;
  proyectos: ReturnType<typeof useProyectosAsesorCatalogo>;
  versiones: ReturnType<typeof useVersionesRepositorioCatalogo>;
  onCambiarProyecto: () => void;
}

export default function AsignarArtefactoDestinoSeccion({
  control,
  proyectos,
  versiones,
  onCambiarProyecto,
}: Props) {
  const opcionesProyecto = proyectos.proyectos.map((p) => ({ id: p.id, etiqueta: p.titulo }));
  const opcionesVersion = versiones.versiones.map((v) => ({
    id: v.id,
    etiqueta: `${v.nombreDocumento} · v${v.numeroVersion}`,
    descripcion: v.repositorioArtefacto.nombreRepositorio,
  }));

  return (
    <FormSection titulo="Destino">
      {proyectos.isLoading && <Skeleton variante="lineas" etiqueta="Cargando proyectos…" />}
      {proyectos.isError && <AvisoNoDisponible recurso="proyectos de grado" />}
      {!proyectos.isLoading && !proyectos.isError && (
        <Controller
          name="proyectoGrado"
          control={control}
          render={({ field, fieldState }) => (
            <Field etiqueta="Proyecto de grado" error={fieldState.error?.message}>
              {(campo) => (
                <Combobox
                  {...campo}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={(id) => {
                    field.onChange(id);
                    onCambiarProyecto();
                  }}
                  opciones={opcionesProyecto}
                  etiquetaElegidos="Proyecto elegido"
                  textoVacio={
                    proyectos.proyectos.length === 0
                      ? 'No tienes proyectos en proceso ni atrasados'
                      : 'No hay proyectos que coincidan.'
                  }
                  placeholder="Busca por título"
                  cargarMas={
                    proyectos.hayMas
                      ? {
                          etiqueta: 'Cargar más proyectos',
                          cargando: proyectos.cargandoMas,
                          onCargar: () => void proyectos.cargarMas(),
                        }
                      : undefined
                  }
                />
              )}
            </Field>
          )}
        />
      )}
      {versiones.isLoading && <Skeleton variante="lineas" etiqueta="Cargando versiones…" />}
      {versiones.isError && <AvisoNoDisponible recurso="versiones de repositorio" />}
      {!versiones.isLoading && !versiones.isError && (
        <Controller
          name="versionRepositorioArtefacto"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              etiqueta="Versión del repositorio"
              ayuda={AYUDA_VERSION}
              error={fieldState.error?.message}
            >
              {(campo) => (
                <Combobox
                  {...campo}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  valor={field.value}
                  onCambiar={field.onChange}
                  opciones={opcionesVersion}
                  etiquetaElegidos="Versión elegida"
                  textoVacio="No hay versiones que coincidan."
                  placeholder="Busca por documento o repositorio"
                  cargarMas={
                    versiones.hayMas
                      ? {
                          etiqueta: 'Cargar más versiones',
                          cargando: versiones.cargandoMas,
                          onCargar: () => void versiones.cargarMas(),
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
