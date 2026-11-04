import { useState } from 'react';
import { useResponderSolicitudCambioAsesor } from '../../hooks/useResponderSolicitudCambioAsesor';
import { useSolicitudesCambioAsesorRecibidas } from '../../hooks/useSolicitudesCambioAsesorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesCambioAsesorRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesCambioAsesorRecibidas(page);
  const { mutate, isPending, reset } = useResponderSolicitudCambioAsesor();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={{ ...consulta, page, goToPage: onPageChange }}
        receptor="coordinador"
        tipo="cambio-asesor"
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
