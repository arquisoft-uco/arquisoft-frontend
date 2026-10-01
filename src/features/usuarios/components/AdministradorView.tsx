import { useState } from 'react';
import { Plus } from 'lucide-react';
import ConsultarUsuarios from './administrador/ConsultarUsuarios';
import ConsultarCoordinadores from './administrador/ConsultarCoordinadores';
import ConsultarEstudiantes from './administrador/ConsultarEstudiantes';
import ConsultarAsesores from './administrador/ConsultarAsesores';
import ConsultarAsesoresFicha from './administrador/ConsultarAsesoresFicha';
import ConsultarRepresentantesComite from './administrador/ConsultarRepresentantesComite';
import ConsultarAdministradores from './administrador/ConsultarAdministradores';
import RegistrarUsuarioForm from './administrador/RegistrarUsuarioForm';

type Pestana =
  | 'usuarios'
  | 'coordinadores'
  | 'estudiantes'
  | 'asesores'
  | 'asesores-ficha'
  | 'representantes-comite'
  | 'administradores';

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'usuarios', etiqueta: 'Todos los usuarios' },
  { id: 'coordinadores', etiqueta: 'Coordinadores' },
  { id: 'estudiantes', etiqueta: 'Estudiantes' },
  { id: 'asesores', etiqueta: 'Asesores' },
  { id: 'asesores-ficha', etiqueta: 'Asesores de ficha' },
  { id: 'representantes-comite', etiqueta: 'Representantes del comité' },
  { id: 'administradores', etiqueta: 'Administradores' },
];

export default function AdministradorView() {
  const [registrarAbierto, setRegistrarAbierto] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>('usuarios');
  const [pestanasMontadas, setPestanasMontadas] = useState<Set<Pestana>>(
    () => new Set<Pestana>(['usuarios']),
  );

  function activarPestana(pestana: Pestana) {
    setPestanaActiva(pestana);
    setPestanasMontadas((actuales) => {
      if (actuales.has(pestana)) return actuales;
      const siguientes = new Set(actuales);
      siguientes.add(pestana);
      return siguientes;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="section-header">
        <h1 className="text-xl font-semibold text-on-surface">Usuarios</h1>
        {!registrarAbierto && (
          <button
            type="button"
            onClick={() => setRegistrarAbierto(true)}
            className="header-action inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:py-2"
          >
            <Plus size={16} aria-hidden />
            Registrar usuario
          </button>
        )}
      </header>

      {registrarAbierto && <RegistrarUsuarioForm onCerrar={() => setRegistrarAbierto(false)} />}

      <div
        role="tablist"
        aria-label="Vistas de usuarios"
        className="flex gap-1 overflow-x-auto border-b border-border sm:gap-2"
      >
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            type="button"
            role="tab"
            id={`usuarios-tab-${pestana.id}`}
            aria-selected={pestanaActiva === pestana.id}
            aria-controls={`usuarios-panel-${pestana.id}`}
            onClick={() => activarPestana(pestana.id)}
            className={[
              'whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
              pestanaActiva === pestana.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-on-surface-secondary hover:text-on-surface',
            ].join(' ')}
          >
            {pestana.etiqueta}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="usuarios-panel-usuarios"
        aria-labelledby="usuarios-tab-usuarios"
        className={pestanaActiva === 'usuarios' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('usuarios') && <ConsultarUsuarios />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-coordinadores"
        aria-labelledby="usuarios-tab-coordinadores"
        className={pestanaActiva === 'coordinadores' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('coordinadores') && <ConsultarCoordinadores />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-estudiantes"
        aria-labelledby="usuarios-tab-estudiantes"
        className={pestanaActiva === 'estudiantes' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('estudiantes') && <ConsultarEstudiantes />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-asesores"
        aria-labelledby="usuarios-tab-asesores"
        className={pestanaActiva === 'asesores' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('asesores') && <ConsultarAsesores />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-asesores-ficha"
        aria-labelledby="usuarios-tab-asesores-ficha"
        className={pestanaActiva === 'asesores-ficha' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('asesores-ficha') && <ConsultarAsesoresFicha />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-representantes-comite"
        aria-labelledby="usuarios-tab-representantes-comite"
        className={pestanaActiva === 'representantes-comite' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('representantes-comite') && <ConsultarRepresentantesComite />}
      </div>
      <div
        role="tabpanel"
        id="usuarios-panel-administradores"
        aria-labelledby="usuarios-tab-administradores"
        className={pestanaActiva === 'administradores' ? undefined : 'hidden'}
      >
        {pestanasMontadas.has('administradores') && <ConsultarAdministradores />}
      </div>
    </div>
  );
}
