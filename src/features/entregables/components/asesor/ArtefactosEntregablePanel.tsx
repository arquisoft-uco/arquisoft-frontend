import { Download, FileText } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useDescargarVersionRepositorio } from '../../../../shared/hooks/useDescargarVersionRepositorio';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useArtefactosEntregable } from '../../hooks/useArtefactosEntregable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';
import { proyectoCerrado } from '../../utils/estado-proyecto';

interface Props {
  entregable: EntregableProyectoGrado;
  onCerrar: () => void;
}

const TEXTO_SECUNDARIO = 'text-sm break-words text-on-surface-secondary';

export default function ArtefactosEntregablePanel({ entregable, onCerrar }: Props) {
  const {
    data: artefactos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useArtefactosEntregable(entregable.id);
  const { descargar, descargando } = useDescargarVersionRepositorio('artefacto');
  const cerrado = proyectoCerrado(entregable);

  function contenido() {
    if (isLoading) {
      return <Skeleton variante="tarjetas" etiqueta="Cargando artefactos…" />;
    }

    if (isError) {
      return (
        <ErrorState
          titulo="No se pudieron cargar los artefactos"
          descripcion={getApiErrorMessage(error, 'Inténtalo nuevamente.')}
          onReintentar={() => void refetch()}
        />
      );
    }

    if (artefactos.length === 0) {
      return (
        <EmptyState
          icono={FileText}
          titulo="Este entregable aún no tiene artefactos"
          descripcion="Cuando se vinculen artefactos al entregable, aparecerán aquí."
        />
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {cerrado && (
          <Notice variante="info">
            El proyecto de este entregable ya está cerrado. Puedes consultar los artefactos, pero
            sus archivos ya no están disponibles para descargar.
          </Notice>
        )}
        <ul aria-label="Artefactos del entregable" className="flex flex-col gap-3">
          {artefactos.map((artefacto) => (
            <li
              key={artefacto.id}
              className="flex flex-col gap-0.5 rounded-xl border border-border p-3.5"
            >
              <span className="text-sm font-semibold break-words text-on-surface">
                {artefacto.nombreDocumento}
              </span>
              <span className={TEXTO_SECUNDARIO}>Repositorio: {artefacto.nombreRepositorio}</span>
              <span className={TEXTO_SECUNDARIO}>
                Ubicación del archivo: <span className="break-all">{artefacto.uriArchivo}</span>
              </span>
              {!cerrado && (
                <Button
                  variante="secundario"
                  tamano="sm"
                  icono={Download}
                  className="mt-2 self-start"
                  aria-label={`Descargar ${artefacto.nombreDocumento}`}
                  disabled={descargando}
                  onClick={() => descargar(artefacto.versionArtefacto, artefacto.nombreDocumento)}
                >
                  Descargar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <SidePanel
      titulo="Artefactos del entregable"
      descripcion={`${entregable.proyectoGrado.nombre} · Versión ${entregable.versionEntregable}`}
      onCerrar={onCerrar}
    >
      {contenido()}
    </SidePanel>
  );
}
