import { useNavigate } from 'react-router';
import { University } from 'lucide-react';
import { useRolesDisponibles } from '../../hooks/useAuth';
import { useRoleStore } from '../../stores/roleStore';
import { ETIQUETAS_ROL, ICONOS_ROL, Rol } from '../../shared/models/rol';

export default function SeleccionarRol() {
  const navigate = useNavigate();
  const rolesDisponibles = useRolesDisponibles();
  const setRolSeleccionado = useRoleStore((s) => s.setRolSeleccionado);

  function seleccionarRol(rol: Rol) {
    setRolSeleccionado(rol);
    navigate('/dashboard');
  }

  return (
    <main
      className="flex w-full flex-col items-center justify-center px-4 py-12"
      role="main"
    >
      <header className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <University size={30} className="text-primary-foreground" aria-hidden />
        </div>
        <h1 id="titulo-seleccion" className="text-2xl font-bold text-on-surface">
          Selecciona tu rol
        </h1>
        <p className="mt-2 text-sm text-on-surface-secondary">
          Elige el rol con el que deseas acceder al sistema.
        </p>
      </header>

      <section
        className="w-full max-w-xl"
        aria-labelledby="titulo-seleccion"
        aria-label="Roles disponibles"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rolesDisponibles.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <p className="text-sm text-on-surface-secondary" role="status">
                No se encontraron roles asignados para tu cuenta. Contacta al administrador.
              </p>
            </div>
          ) : (
            rolesDisponibles.map((rol) => {
              const Icon = ICONOS_ROL[rol];
              return (
                <button
                  key={rol}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-6 text-center shadow-sm outline-none transition-all duration-200 hover:border-primary hover:shadow-md active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  type="button"
                  onClick={() => seleccionarRol(rol)}
                  aria-label={`Seleccionar rol: ${ETIQUETAS_ROL[rol]}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted transition-colors duration-200 group-hover:bg-primary group-focus-visible:bg-primary">
                    <Icon
                      size={24}
                      className="text-primary-muted-foreground transition-colors duration-200 group-hover:text-primary-foreground group-focus-visible:text-primary-foreground"
                      aria-hidden
                    />
                  </div>
                  <span className="text-sm font-semibold leading-snug text-on-surface">
                    {ETIQUETAS_ROL[rol]}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
