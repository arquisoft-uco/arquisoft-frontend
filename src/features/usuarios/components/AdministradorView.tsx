import { useState } from 'react';
import { Plus } from 'lucide-react';
import RegistrarUsuarioForm from './administrador/RegistrarUsuarioForm';

// Cuando exista GET /usuarios: este componente pasa a ser el listado (patrón
// ConsultarFichasPerfilCoordinador con accionHeader/formulario) y el retorno mantiene su filtro/página.
export default function AdministradorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface">Usuarios</h2>
        {!registrarAbierto && (
          <button
            type="button"
            onClick={() => setRegistrarAbierto(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} aria-hidden />
            Registrar usuario
          </button>
        )}
      </div>

      {registrarAbierto && (
        <RegistrarUsuarioForm onCerrar={() => setRegistrarAbierto(false)} />
      )}
    </div>
  );
}
