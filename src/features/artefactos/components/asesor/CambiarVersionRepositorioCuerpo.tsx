import { GitCompareArrows } from 'lucide-react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Field from '../../../../shared/components/ui/Field';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import type { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import type { useVersionesElegiblesArtefacto } from '../../hooks/useVersionesElegiblesArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import { motivoBloqueoCambioVersion } from '../../utils/cambio-version-repositorio';

interface Props {
  artefacto: ArtefactoAsesor;
  ultima: ReturnType<typeof useUltimaVersionArtefacto>;
  candidatas: ReturnType<typeof useVersionesElegiblesArtefacto>;
  bloqueado: boolean;
  seleccion: string;
  errorCampo?: string;
  onElegir: (id: string) => void;
}

export default function CambiarVersionRepositorioCuerpo({
  artefacto,
  ultima,
  candidatas,
  bloqueado,
  seleccion,
  errorCampo,
  onElegir,
}: Props) {
  if (ultima.isError) {
    return (
      <ErrorState
        titulo="No se pudo consultar la última versión"
        descripcion="Sin ese dato no podemos saber si el cambio está permitido."
        onReintentar={() => void ultima.refetch()}
      />
    );
  }
  if (ultima.isLoading || ultima.ultimaVersion === undefined) {
    return <Skeleton variante="lineas" etiqueta="Cargando versiones…" />;
  }
  if (bloqueado) {
    return (
      <Notice variante="advertencia">{motivoBloqueoCambioVersion(ultima.ultimaVersion)}</Notice>
    );
  }
  if (candidatas.isLoading) {
    return <Skeleton variante="lineas" etiqueta="Cargando versiones del documento…" />;
  }
  if (candidatas.isError) return <AvisoNoDisponible recurso="versiones del documento" />;

  const opciones = candidatas.versiones.map((version) => ({
    id: version.id,
    etiqueta: `Versión ${version.numeroVersion}`,
    descripcion: version.nombreArchivo,
  }));
  if (opciones.length === 0) {
    return (
      <EmptyState
        icono={GitCompareArrows}
        titulo="Este documento no tiene otras versiones en el repositorio."
        descripcion="Cuando el repositorio publique otra versión, podrás elegirla aquí."
      />
    );
  }

  return (
    <Field
      etiqueta="Nueva versión"
      ayuda={`Versión actual: ${artefacto.versionDocumento}.`}
      error={errorCampo}
    >
      {(control) => (
        <Combobox
          {...control}
          valor={seleccion}
          onCambiar={onElegir}
          opciones={opciones}
          etiquetaElegidos="Versión elegida"
          textoVacio="No hay versiones que coincidan."
          placeholder="Busca por versión o archivo"
          cargarMas={
            candidatas.hayMas
              ? {
                  etiqueta: 'Cargar más versiones',
                  cargando: candidatas.cargandoMas,
                  onCargar: () => void candidatas.cargarMas(),
                }
              : undefined
          }
        />
      )}
    </Field>
  );
}
