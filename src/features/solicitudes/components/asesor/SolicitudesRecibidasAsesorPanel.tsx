import { useState } from 'react';
import { useResponderSolicitudNovedadAsesor } from '../../hooks/useResponderSolicitudNovedadAsesor';
import { useSolicitudesNovedadAsesorRecibidas } from '../../hooks/useSolicitudesNovedadAsesorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesRecibidasAsesorPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesNovedadAsesorRecibidas(page);
  const { mutate, isPending, reset } = useResponderSolicitudNovedadAsesor();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={{ ...consulta, page, goToPage: onPageChange }}
        receptor="asesor"
        onResponder={setSolicitudAResponder}
      />

      {solicitudAResponder && (
        <ResponderSolicitudForm
          solicitud={solicitudAResponder}
          onCerrar={() => setSolicitudAResponder(null)}
          responder={mutate}
          respondiendo={isPending}
          reiniciar={reset}
        />
      )}
    </div>
  );
}
