import { useState } from 'react';
import PageHeader from '../../../shared/components/ui/PageHeader';
import SolicitudesRegistroModificacionUsuariosRecibidasPanel from './administrador/SolicitudesRegistroModificacionUsuariosRecibidasPanel';

export default function AdministradorView() {
  const [paginaRecibidas, setPaginaRecibidas] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Consulta las solicitudes de registro y modificación de usuarios que te enviaron los coordinadores."
      />
      <SolicitudesRegistroModificacionUsuariosRecibidasPanel
        page={paginaRecibidas}
        onPageChange={setPaginaRecibidas}
      />
    </div>
  );
}
