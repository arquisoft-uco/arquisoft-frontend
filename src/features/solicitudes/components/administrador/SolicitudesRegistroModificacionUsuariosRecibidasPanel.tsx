import { useState } from 'react';
import { useResponderSolicitudRegistroModificacionUsuarios } from '../../hooks/useResponderSolicitudRegistroModificacionUsuarios';
import { useSolicitudesRegistroModificacionUsuariosRecibidas } from '../../hooks/useSolicitudesRegistroModificacionUsuariosRecibidas';
import type { Solicitud } from '../../models/Solicitud';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';
import ResponderSolicitudForm from '../ResponderSolicitudForm';

const RAIZ = 'flex flex-col gap-4';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesRegistroModificacionUsuariosRecibidasPanel({
  page,
  onPageChange,
}: Props) {
  const consulta = useSolicitudesRegistroModificacionUsuariosRecibidas(page);
  const { mutate, isPending, reset } = useResponderSolicitudRegistroModificacionUsuarios();
  const [solicitudAResponder, setSolicitudAResponder] = useState<Solicitud | null>(null);

  return (
    <div className={RAIZ}>
      <ListadoSolicitudesRecibidas
        consulta={{ ...consulta, page, goToPage: onPageChange }}
        receptor="administrador"
        tipo="registro-modificacion-usuarios"
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
