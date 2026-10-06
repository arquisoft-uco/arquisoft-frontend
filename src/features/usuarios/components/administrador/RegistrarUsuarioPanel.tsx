import { useForm, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorSummary, { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import type { Rol } from '../../../../shared/models/rol';
import { useEnvioFormularioUsuario } from '../../hooks/useEnvioFormularioUsuario';
import { useRegistrarUsuario } from '../../hooks/useRegistrarUsuario';
import { registrarUsuarioSchema } from '../../utils/registrar-usuario-schema';
import type { RegistrarUsuarioValues } from '../../utils/registrar-usuario-schema';
import RegistrarUsuarioCampos, { ETIQUETAS_CAMPO } from './RegistrarUsuarioCampos';

const ID_FORMULARIO = 'registrar-usuario';
const CAMPOS = ['identificador', 'email', 'nombres', 'apellidos', 'contacto'] as const;

type Campo = (typeof CAMPOS)[number];

const ALIAS_DEL_BACKEND: Record<string, readonly Campo[]> = { nombre: ['nombres', 'apellidos'] };
const VALORES_INICIALES: RegistrarUsuarioValues = {
  identificador: '',
  nombres: '',
  apellidos: '',
  email: '',
  contacto: '',
  roles: [],
};
const PAR_DE_NOMBRES: Record<string, 'nombres' | 'apellidos' | undefined> = {
  nombres: 'apellidos',
  apellidos: 'nombres',
};
const FORMULARIO = 'flex flex-col gap-6';
const FRASE = 'text-sm text-on-surface-secondary';

interface Props {
  onCerrar: () => void;
}

export default function RegistrarUsuarioPanel({ onCerrar }: Props) {
  const formulario = useForm<RegistrarUsuarioValues>({
    resolver: zodResolver(registrarUsuarioSchema),
    defaultValues: VALORES_INICIALES,
    mode: 'onTouched',
  });
  const { errors, isDirty } = formulario.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useRegistrarUsuario();
  const { resumenVisible, irAlCampo, alInvalido, alErrorDeApi, cerrar } = useEnvioFormularioUsuario(
    {
      formulario,
      campos: CAMPOS,
      reiniciarMutacion,
      onCerrar,
      alias: ALIAS_DEL_BACKEND,
    },
  );

  const roles = formulario.watch('roles') ?? [];
  const errores = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  // El otro campo se revalida solo si ya se tocó, para no pintar error en uno aún sin visitar.
  const registrar: UseFormRegister<RegistrarUsuarioValues> = (nombre, opciones) => {
    const par = PAR_DE_NOMBRES[nombre];
    if (!par) return formulario.register(nombre, opciones);
    const revalidarPar = () => {
      if (formulario.getFieldState(par).isTouched) formulario.trigger(par);
    };
    return formulario.register(nombre, {
      ...opciones,
      onChange: revalidarPar,
      onBlur: revalidarPar,
    });
  };

  function alternarRol(rol: Rol) {
    const siguientes = roles.includes(rol) ? roles.filter((r) => r !== rol) : [...roles, rol];
    formulario.setValue('roles', siguientes, { shouldDirty: true, shouldValidate: true });
  }

  function enviar(valores: RegistrarUsuarioValues) {
    mutate(valores, {
      onSuccess: () => {
        toast.success(
          'Usuario registrado',
          `${valores.nombres} ${valores.apellidos} fue registrado correctamente.`,
        );
        onCerrar();
      },
      onError: (err) => alErrorDeApi(err, 'No se pudo registrar el usuario'),
    });
  }

  return (
    <SidePanel
      titulo="Registrar usuario"
      descripcion="Crea la cuenta y, si quieres, asígnale roles ahora."
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Registrar usuario"
          accionEnviando="Registrando…"
          enviando={isPending}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <form
        id={ID_FORMULARIO}
        aria-label="Registro de usuario"
        noValidate
        aria-busy={isPending}
        onSubmit={formulario.handleSubmit(enviar, alInvalido)}
        className={FORMULARIO}
      >
        <p className={FRASE}>
          Todos los campos son obligatorios salvo los marcados como opcionales.
        </p>
        <RegistrarUsuarioCampos
          register={registrar}
          errors={errors}
          rolesSeleccionados={roles}
          onAlternarRol={alternarRol}
        />
        <ErrorSummary errores={errores} onIrAlCampo={irAlCampo} />
      </form>
    </SidePanel>
  );
}
