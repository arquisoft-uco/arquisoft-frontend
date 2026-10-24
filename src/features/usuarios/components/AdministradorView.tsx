import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import type { PestanaUsuario } from '../models/PestanaUsuario';
import type { Usuario } from '../models/Usuario';
import ConsultarUsuarios from './administrador/ConsultarUsuarios';
import EditarUsuarioPanel from './administrador/EditarUsuarioPanel';
import RegistrarUsuarioPanel from './administrador/RegistrarUsuarioPanel';

type PanelUsuarios =
  | { tipo: 'registrar' }
  | { tipo: 'editar'; usuario: Usuario; pestana: PestanaUsuario };

export default function AdministradorView() {
  const [panel, setPanel] = useState<PanelUsuarios | null>(null);

  function abrirRegistro() {
    setPanel({ tipo: 'registrar' });
  }

  function abrirEdicion(usuario: Usuario, pestana: PestanaUsuario) {
    setPanel({ tipo: 'editar', usuario, pestana });
  }

  function cerrarPanel() {
    setPanel(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas, roles y estado de acceso."
        acciones={
          <Button icono={Plus} onClick={abrirRegistro}>
            Registrar usuario
          </Button>
        }
      />

      <ConsultarUsuarios onRegistrar={abrirRegistro} onEditar={abrirEdicion} />

      {panel?.tipo === 'registrar' && <RegistrarUsuarioPanel onCerrar={cerrarPanel} />}
      {panel?.tipo === 'editar' && (
        <EditarUsuarioPanel
          key={panel.usuario.id}
          usuario={panel.usuario}
          pestanaInicial={panel.pestana}
          onCerrar={cerrarPanel}
        />
      )}
    </div>
  );
}
