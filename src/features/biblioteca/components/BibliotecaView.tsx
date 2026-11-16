import { useHasRole } from '../../../hooks/useHasRole';
import PageHeader from '../../../shared/components/ui/PageHeader';
import { Rol } from '../../../shared/models/rol';
import AyudaEstadosDocumentacion from './AyudaEstadosDocumentacion';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';

const ROLES_CONSULTAN_ESTADOS = [Rol.Bibliotecario];
const ROLES_VEN_AUTORES = [Rol.Bibliotecario];

export default function BibliotecaView() {
  const puedeConsultarEstados = useHasRole(ROLES_CONSULTAN_ESTADOS);
  const puedeVerAutores = useHasRole(ROLES_VEN_AUTORES);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Biblioteca"
        descripcion="Consulta la documentación publicada de los proyectos de grado."
        acciones={puedeConsultarEstados ? <AyudaEstadosDocumentacion /> : undefined}
      />
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={puedeConsultarEstados}
        puedeVerAutores={puedeVerAutores}
      />
    </div>
  );
}
