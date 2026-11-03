import { useState } from 'react';
import { FileStack } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useParticipacionesEstudiante } from '../../hooks/useParticipacionesEstudiante';
import { useUltimasVersionesEstudiante } from '../../hooks/useUltimasVersionesEstudiante';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import { motivoBloqueoSubida } from '../../utils/bloqueo-subida-version';
import GestionarRevisionEstudiantePanel from './GestionarRevisionEstudiantePanel';
import ParticipacionesProyectoTabla from './ParticipacionesProyectoTabla';
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const LISTA = 'flex flex-col gap-6';

function textoResumen(artefactos: number, proyectos: number): string {
  const textoArtefactos = `${artefactos} ${artefactos === 1 ? 'artefacto' : 'artefactos'}`;
  const textoProyectos = `${proyectos} ${proyectos === 1 ? 'proyecto' : 'proyectos'}`;
  return `${textoArtefactos} en ${textoProyectos}`;
}

interface PanelAbierto {
  artefacto: ArtefactoParaVersion;
  modo: 'gestionar' | 'subir';
}

function aArtefacto(participacion: ParticipacionArtefacto): ArtefactoParaVersion {
  return {
    id: participacion.id,
    nombreProyecto: participacion.nombreProyecto,
    nombreDocumento: participacion.nombreDocumento,
    versionDocumento: participacion.versionDocumento,
  };
}

export default function ConsultarParticipacionesEstudiante() {
  const { proyectos, totalArtefactos, isLoading, isError, error, refetch, isFetching } =
    useParticipacionesEstudiante();
  const idsArtefactos = proyectos.flatMap((proyecto) =>
    proyecto.participaciones.filter((p) => !p.omitido).map((p) => p.id),
  );
  const { ultimaVersion, isError: ultimasConError } = useUltimasVersionesEstudiante(idsArtefactos);
  const [panel, setPanel] = useState<PanelAbierto | null>(null);

  function motivoBloqueo(participacion: ParticipacionArtefacto): string | null | undefined {
    if (participacion.omitido) return null;
    const ultima = ultimaVersion(participacion.id);
    if (ultima === undefined) return ultimasConError ? null : undefined;
    return motivoBloqueoSubida(ultima);
  }

  const resumen =
    isLoading || isError || totalArtefactos === 0
      ? ''
      : textoResumen(totalArtefactos, proyectos.length);

  return (
    <div className={RAIZ}>
      <p aria-live="polite" className={RESUMEN}>
        {resumen}
      </p>

      <div aria-busy={isFetching}>
        {isLoading ? (
          <Skeleton variante="tabla" etiqueta="Cargando artefactos en los que participas…" />
        ) : isError ? (
          <ErrorState
            titulo="No se pudo cargar tu participación"
            descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
            onReintentar={refetch}
          />
        ) : proyectos.length === 0 ? (
          <EmptyState
            icono={FileStack}
            titulo="Aún no participas en artefactos"
            descripcion="Aparecerán aquí cuando te asignen a un artefacto de tus proyectos de grado."
          />
        ) : (
          <div className={LISTA}>
            {proyectos.map((proyecto) => (
              <ParticipacionesProyectoTabla
                key={proyecto.proyectoGrado}
                proyecto={proyecto}
                motivoBloqueo={motivoBloqueo}
                onGestionarRevision={(p) =>
                  setPanel({ artefacto: aArtefacto(p), modo: 'gestionar' })
                }
                onSubirVersion={(p) => setPanel({ artefacto: aArtefacto(p), modo: 'subir' })}
              />
            ))}
          </div>
        )}
      </div>
      {panel?.modo === 'gestionar' && (
        <GestionarRevisionEstudiantePanel
          artefacto={panel.artefacto}
          onCerrar={() => setPanel(null)}
        />
      )}
      {panel?.modo === 'subir' && (
        <SubirVersionArtefactoPanel artefacto={panel.artefacto} onCerrar={() => setPanel(null)} />
      )}
    </div>
  );
}
