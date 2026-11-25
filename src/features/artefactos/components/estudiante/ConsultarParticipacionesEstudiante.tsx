import { useState } from 'react';
import PaginadorListado from '../../../../shared/components/PaginadorListado';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useParticipacionesEstudiante } from '../../hooks/useParticipacionesEstudiante';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import { motivoBloqueoSubidaDeParticipacion } from '../../utils/bloqueo-subida-version';
import { guiaParticipacionEstudiante } from '../../utils/guia-artefacto';
import { OPCIONES_ORDEN_PARTICIPACIONES } from '../../utils/orden-participaciones';
import FiltrosArtefactosEstudiante from './FiltrosArtefactosEstudiante';
import GestionarRevisionEstudiantePanel from './GestionarRevisionEstudiantePanel';
import ParticipacionesProyectoTabla from './ParticipacionesProyectoTabla';
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';
import VacioParticipaciones from './VacioParticipaciones';

const RAIZ = 'flex flex-col gap-4';
const RESUMEN = 'min-h-5 text-[13px] text-on-surface-secondary';
const LISTA = 'flex flex-col gap-6';
const SIN_ESTADOS: EstadoRevisionAsesor[] = [];

function textoResumen(total?: number): string {
  if (total === undefined) return '';
  return `${total} ${total === 1 ? 'artefacto' : 'artefactos'}`;
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
  const listado = useParticipacionesEstudiante();
  const { proyectos, data, isLoading, isError, error, refetch, isFetching } = listado;
  const [panel, setPanel] = useState<PanelAbierto | null>(null);
  const artefactosEnPagina = data?.content.length ?? 0;

  function motivoBloqueo(participacion: ParticipacionArtefacto): string | null | undefined {
    if (participacion.omitido) return null;
    return motivoBloqueoSubidaDeParticipacion(participacion.estadoUltimaRevision, listado.estados);
  }

  function avisoFila(participacion: ParticipacionArtefacto): string | null | undefined {
    if (participacion.omitido) return motivoBloqueo(participacion);
    return guiaParticipacionEstudiante(participacion.estadoUltimaRevision, listado.estados);
  }

  return (
    <div className={RAIZ}>
      <FiltrosArtefactosEstudiante
        listado={listado}
        totalResultados={data?.totalElements}
        opcionesOrden={OPCIONES_ORDEN_PARTICIPACIONES}
      />

      <p aria-live="polite" className={RESUMEN}>
        {isLoading || isError ? '' : textoResumen(data?.totalElements)}
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
          <VacioParticipaciones
            hayFiltros={listado.hayFiltros}
            onLimpiarFiltros={listado.limpiarFiltros}
          />
        ) : (
          <div className={LISTA}>
            {proyectos.map((proyecto) => (
              <ParticipacionesProyectoTabla
                key={proyecto.proyectoGrado}
                proyecto={proyecto}
                motivoBloqueo={motivoBloqueo}
                avisoFila={avisoFila}
                estados={listado.estados ?? SIN_ESTADOS}
                onGestionarRevision={(p) =>
                  setPanel({ artefacto: aArtefacto(p), modo: 'gestionar' })
                }
                onSubirVersion={(p) => setPanel({ artefacto: aArtefacto(p), modo: 'subir' })}
              />
            ))}
          </div>
        )}
      </div>

      {!isError && !isLoading && artefactosEnPagina > 0 && (
        <PaginadorListado
          page={listado.page}
          pageSize={listado.pageSize}
          totalPages={data?.totalPages ?? 0}
          totalElements={data?.totalElements ?? 0}
          cantidadEnPagina={artefactosEnPagina}
          etiquetaPlural="artefactos"
          onPageChange={listado.goToPage}
        />
      )}
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
