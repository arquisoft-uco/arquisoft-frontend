import { useState } from 'react';
import { FileStack } from 'lucide-react';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useParticipacionesEstudiante } from '../../hooks/useParticipacionesEstudiante';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
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

export default function ConsultarParticipacionesEstudiante() {
  const { proyectos, totalArtefactos, isLoading, isError, error, refetch, isFetching } =
    useParticipacionesEstudiante();
  const [artefactoElegido, setArtefactoElegido] = useState<ArtefactoParaVersion | null>(null);

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
                onAbrir={setArtefactoElegido}
              />
            ))}
          </div>
        )}
      </div>
      {artefactoElegido && (
        <SubirVersionArtefactoPanel
          artefacto={artefactoElegido}
          onCerrar={() => setArtefactoElegido(null)}
        />
      )}
    </div>
  );
}
