import { useHasRole } from '../../../hooks/useHasRole';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { Rol } from '../../../shared/models/rol';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';

const ROLES_FILTRAN_ESTADO = [Rol.Bibliotecario];

export default function BibliotecaView() {
  const puedeFiltrarPorEstado = useHasRole(ROLES_FILTRAN_ESTADO);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Biblioteca"
        descripcion="Consulta la documentación publicada de los proyectos de grado."
      />
      <ConsultarDocumentaciones puedeFiltrarPorEstado={puedeFiltrarPorEstado} />
    </div>
  );
}
