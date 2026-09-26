import { useState } from 'react';
import { Plus } from 'lucide-react';
import ConsultarCoordinadores from './administrador/ConsultarCoordinadores';
import RegistrarUsuarioForm from './administrador/RegistrarUsuarioForm';

export default function AdministradorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  return (
    <ConsultarCoordinadores
      accionHeader={
        !registrarAbierto && (
          <button
            type="button"
            onClick={() => setRegistrarAbierto(true)}
            className="header-action inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:py-2"
          >
            <Plus size={16} aria-hidden />
            Registrar usuario
          </button>
        )
      }
      formulario={
        registrarAbierto && <RegistrarUsuarioForm onCerrar={() => setRegistrarAbierto(false)} />
      }
    />
  );
}
