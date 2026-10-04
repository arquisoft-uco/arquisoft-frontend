import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Avatar from '../../../../shared/components/ui/Avatar';
import { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Tabs from '../../../../shared/components/ui/Tabs';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import type { PestanaUsuario } from '../../models/PestanaUsuario';
import type { Usuario } from '../../models/Usuario';
import { editarUsuarioSchema } from '../../utils/editar-usuario-schema';
import type { EditarUsuarioValues } from '../../utils/editar-usuario-schema';
import { aplicarErroresDeApi } from '../../utils/errores-api-usuario';
import EditarUsuarioAcceso from './EditarUsuarioAcceso';
import EditarUsuarioDatos, { ETIQUETAS_CAMPO } from './EditarUsuarioDatos';
import EditarUsuarioRoles from './EditarUsuarioRoles';
import PieEditarUsuario from './PieEditarUsuario';
import { InsigniaEstadoUsuario } from './UsuarioCeldas';

const ID_FORMULARIO = 'editar-usuario';
const CAMPOS = ['identificador', 'nombre', 'email', 'contacto'] as const;
const PESTANAS: { id: PestanaUsuario; etiqueta: string }[] = [
  { id: 'datos', etiqueta: 'Datos' },
  { id: 'roles', etiqueta: 'Roles' },
  { id: 'acceso', etiqueta: 'Acceso' },
];
const CUERPO = 'flex flex-col gap-4';
// Las pestañas se quedan bajo la cabecera al desplazar el cuerpo del panel: el margen y el offset negativos igualan el relleno del cuerpo.
const BARRA_PESTANAS =
  'sticky -top-4 z-10 -mx-4 -mt-4 bg-surface px-4 pt-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6';

interface Props {
  usuario: Usuario;
  pestanaInicial: PestanaUsuario;
  onCerrar: () => void;
}

export default function EditarUsuarioPanel({ usuario, pestanaInicial, onCerrar }: Props) {
  const [pestana, setPestana] = useState<PestanaUsuario>(pestanaInicial);
  const [resumenVisible, setResumenVisible] = useState(false);
  const formulario = useForm<EditarUsuarioValues>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: {
      identificador: usuario.identificador,
      nombre: usuario.nombre,
      email: usuario.email,
      contacto: usuario.contacto,
    },
    mode: 'onTouched',
  });
  const { errors, isDirty } = formulario.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarUsuario();
  const estados = useEstadosUsuario();

  const resumen = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) formulario.setFocus(destino);
  }

  function alInvalido() {
    setResumenVisible(true);
  }

  function enviar(valores: EditarUsuarioValues) {
    mutate(
      { usuarioId: usuario.id, req: valores },
      {
        onSuccess: () => {
          toast.success('Usuario actualizado', `${valores.nombre} fue actualizado correctamente.`);
          onCerrar();
        },
        onError: (err) => {
          toast.error(
            'No se pudo actualizar el usuario',
            getApiErrorMessage(err, 'Inténtalo nuevamente.'),
          );
          aplicarErroresDeApi(err, formulario.setError, CAMPOS);
          setResumenVisible(true);
        },
      },
    );
  }

  function cerrar() {
    formulario.reset();
    reiniciarMutacion();
    onCerrar();
  }

  return (
    <SidePanel
      titulo={usuario.nombre}
      descripcion={usuario.email}
      inicio={<Avatar nombre={usuario.nombre} />}
      fin={<InsigniaEstadoUsuario usuario={usuario} estados={estados.data} />}
      sucio={isDirty}
      ocupado={isPending}
      onCerrar={cerrar}
      pie={(solicitarCierre) => (
        <PieEditarUsuario
          pestana={pestana}
          formId={ID_FORMULARIO}
          enviando={isPending}
          sucio={isDirty}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <div className={CUERPO}>
        <div className={BARRA_PESTANAS}>
          <Tabs
            items={PESTANAS}
            valor={pestana}
            etiqueta="Secciones del usuario"
            onCambiar={setPestana}
          />
        </div>
        <div role="tabpanel" aria-label="Datos" hidden={pestana !== 'datos'}>
          <EditarUsuarioDatos
            formId={ID_FORMULARIO}
            register={formulario.register}
            errors={errors}
            enviando={isPending}
            onSubmit={formulario.handleSubmit(enviar, alInvalido)}
            resumen={resumen}
            onIrAlCampo={irAlCampo}
          />
        </div>
        <div role="tabpanel" aria-label="Roles" hidden={pestana !== 'roles'}>
          <EditarUsuarioRoles usuario={usuario} />
        </div>
        <div role="tabpanel" aria-label="Acceso" hidden={pestana !== 'acceso'}>
          <EditarUsuarioAcceso usuario={usuario} estados={estados} onCerrarPanel={onCerrar} />
        </div>
      </div>
    </SidePanel>
  );
}
