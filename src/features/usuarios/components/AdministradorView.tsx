import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarUsuarios from './administrador/ConsultarUsuarios';
import RegistrarUsuarioForm from './administrador/RegistrarUsuarioForm';

export default function AdministradorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas, roles y estado de acceso."
        acciones={
          !registrarAbierto && (
            <Button icono={Plus} onClick={() => setRegistrarAbierto(true)}>
              Registrar usuario
            </Button>
          )
        }
      />

      {registrarAbierto && <RegistrarUsuarioForm onCerrar={() => setRegistrarAbierto(false)} />}

      <ConsultarUsuarios onRegistrar={() => setRegistrarAbierto(true)} />
    </div>
  );
}
