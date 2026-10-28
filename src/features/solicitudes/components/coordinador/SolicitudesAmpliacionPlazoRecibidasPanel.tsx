import { useState } from 'react';
import { useResponderSolicitudAmpliacionPlazo } from '../../hooks/useResponderSolicitudAmpliacionPlazo';
import { useSolicitudesAmpliacionPlazoRecibidas } from '../../hooks/useSolicitudesAmpliacionPlazoRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesAmpliacionPlazoRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesAmpliacionPlazoRecibidas(page);
  const { mutate, isPending, reset } = useResponderSolicitudAmpliacionPlazo();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={{ ...consulta, page, goToPage: onPageChange }}
        receptor="coordinador"
        tipo="ampliacion-plazo"
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
