import { useState } from 'react';
import { useResponderSolicitudNovedadCoordinador } from '../../hooks/useResponderSolicitudNovedadCoordinador';
import { useSolicitudesNovedadCoordinadorRecibidas } from '../../hooks/useSolicitudesNovedadCoordinadorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesNovedadCoordinadorRecibidas(page);
  const { mutate, isPending, reset } = useResponderSolicitudNovedadCoordinador();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={{ ...consulta, page, goToPage: onPageChange }}
        receptor="coordinador"
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
