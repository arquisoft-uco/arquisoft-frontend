import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import EnlaceVersionesArtefacto from '../EnlaceVersionesArtefacto';
import InsigniaOmitido from '../InsigniaOmitido';

const MOTIVO = 'block text-[13px] text-on-surface-secondary';

export type MotivoBloqueo = (participacion: ParticipacionArtefacto) => string | null | undefined;

interface Props {
  participacion: ParticipacionArtefacto;
  avisoFila: MotivoBloqueo;
}

export default function NombreArtefacto({ participacion, avisoFila }: Props) {
  const motivo = participacion.omitido ? undefined : avisoFila(participacion);

  return (
    <>
      <EnlaceVersionesArtefacto
        artefactoId={participacion.id}
        nombreDocumento={participacion.nombreDocumento}
        vista="versiones-revisiones"
      />
      {participacion.omitido && <InsigniaOmitido />}
      {motivo && <span className={MOTIVO}>{motivo}</span>}
    </>
  );
}
