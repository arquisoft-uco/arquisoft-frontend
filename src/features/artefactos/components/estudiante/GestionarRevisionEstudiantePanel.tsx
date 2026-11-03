import { useState } from 'react';
import { useUltimaRevisionArtefacto } from '../../hooks/useUltimaRevisionArtefacto';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import type { RevisionGestionable } from '../../models/RevisionGestionable';
import DetalleRevisionEstudianteContenido from './DetalleRevisionEstudianteContenido';
import MarcarRevisionResueltaDialog from './MarcarRevisionResueltaDialog';
import SinRevisionArtefactoPanel from './SinRevisionArtefactoPanel';
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';

interface Props {
  artefacto: ArtefactoParaVersion;
  revision?: RevisionGestionable;
  onCerrar: () => void;
}

export default function GestionarRevisionEstudiantePanel({ artefacto, revision, onCerrar }: Props) {
  const ultima = useUltimaRevisionArtefacto(artefacto.id);
  const [subiendo, setSubiendo] = useState(false);
  const [resolviendo, setResolviendo] = useState(false);
  const revisionActiva = revision ?? ultima.revision;

  return (
    <>
      {revisionActiva ? (
        <DetalleRevisionEstudianteContenido
          revision={revisionActiva}
          onSubir={() => setSubiendo(true)}
          onResolver={() => setResolviendo(true)}
          onCerrar={onCerrar}
        />
      ) : (
        <SinRevisionArtefactoPanel
          artefacto={artefacto}
          ultima={ultima.ultima}
          isLoading={ultima.isLoading}
          isError={ultima.isError}
          onReintentar={() => void ultima.refetch()}
          puedeSubir={ultima.puedeSubir}
          motivoSubida={ultima.motivoSubida}
          onSubir={() => setSubiendo(true)}
          onCerrar={onCerrar}
        />
      )}
      {subiendo && (
        <SubirVersionArtefactoPanel artefacto={artefacto} onCerrar={() => setSubiendo(false)} />
      )}
      {resolviendo && revisionActiva && (
        <MarcarRevisionResueltaDialog
          revisionAsesorId={revisionActiva.id}
          nombreDocumento={revisionActiva.nombreDocumento}
          version={revisionActiva.version}
          onCerrar={() => setResolviendo(false)}
          onResuelta={onCerrar}
        />
      )}
    </>
  );
}
