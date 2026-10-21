import { useState } from 'react';
import { useResponderSolicitudNovedadAsesor } from '../../hooks/useResponderSolicitudNovedadAsesor';
import { useSolicitudesNovedadAsesorRecibidas } from '../../hooks/useSolicitudesNovedadAsesorRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

export default function SolicitudesRecibidasAsesorPanel() {
  const consulta = useSolicitudesNovedadAsesorRecibidas();
  const { mutate, isPending, reset } = useResponderSolicitudNovedadAsesor();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={consulta}
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
