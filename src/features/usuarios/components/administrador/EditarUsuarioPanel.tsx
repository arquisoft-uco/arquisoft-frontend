import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Avatar from '../../../../shared/components/ui/Avatar';
import { resumirErrores } from '../../../../shared/components/ui/ErrorSummary';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import Tabs from '../../../../shared/components/ui/Tabs';
import { toast } from '../../../../shared/hooks/useToast';
import { useEnvioFormularioUsuario } from '../../hooks/useEnvioFormularioUsuario';
import { useEstadosUsuario } from '../../hooks/useEstadosUsuario';
import { useIdentidadUsuario } from '../../hooks/useIdentidadUsuario';
import { useModificarUsuario } from '../../hooks/useModificarUsuario';
import { useParDeNombres } from '../../hooks/useParDeNombres';
import type { PestanaUsuario } from '../../models/PestanaUsuario';
import type { Usuario } from '../../models/Usuario';
import { editarUsuarioSchema } from '../../utils/editar-usuario-schema';
import type { EditarUsuarioValues } from '../../utils/editar-usuario-schema';
import EditarUsuarioAcceso from './EditarUsuarioAcceso';
import EditarUsuarioDatos, { ETIQUETAS_CAMPO } from './EditarUsuarioDatos';
import EditarUsuarioRoles from './EditarUsuarioRoles';
import PieEditarUsuario from './PieEditarUsuario';
import { InsigniaEstadoUsuario } from './UsuarioCeldas';

const ID_FORMULARIO = 'editar-usuario';
const ID_PESTANAS = 'editar-usuario-tabs';
const CAMPOS = ['identificador', 'nombres', 'apellidos', 'email', 'contacto'] as const;
const ALIAS_DEL_BACKEND = { nombre: ['nombres', 'apellidos'] } as const;
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
  const identidad = useIdentidadUsuario(usuario.id);
  const { identificador, email, contacto } = usuario;
  const formulario = useForm<EditarUsuarioValues>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: { identificador, email, contacto, nombres: '', apellidos: '' },
    values: identidad.data && { identificador, email, contacto, ...identidad.data },
    resetOptions: { keepDirtyValues: true },
    mode: 'onTouched',
  });
  const { errors, isDirty } = formulario.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarUsuario();
  const estados = useEstadosUsuario();
  const { resumenVisible, irAlCampo, alInvalido, alErrorDeApi, cerrar } = useEnvioFormularioUsuario(
    { formulario, campos: CAMPOS, reiniciarMutacion, onCerrar, alias: ALIAS_DEL_BACKEND },
  );
  const registrar = useParDeNombres(formulario);

  const resumen = resumenVisible ? resumirErrores(errors, ETIQUETAS_CAMPO) : [];

  function enviar(valores: EditarUsuarioValues) {
    mutate(
      { usuarioId: usuario.id, req: valores },
      {
        onSuccess: () => {
          toast.success(
            'Cambios guardados',
            `Los datos de ${valores.nombres} ${valores.apellidos} se guardaron.`,
          );
          onCerrar();
        },
        onError: (err) => alErrorDeApi(err, 'No se pudieron guardar los cambios'),
      },
    );
  }

  // Si Datos tiene cambios sin guardar, el éxito de Acceso no cierra el panel: vuelve a Datos.
  const panelDe = (id: PestanaUsuario) => ({
    role: 'tabpanel',
    id: `${ID_PESTANAS}-panel-${id}`,
    'aria-labelledby': `${ID_PESTANAS}-pestana-${id}`,
    hidden: pestana !== id,
  });

  function alTerminarEnAcceso() {
    if (isDirty) setPestana('datos');
    else onCerrar();
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
            idBase={ID_PESTANAS}
            onCambiar={setPestana}
          />
        </div>
        <div {...panelDe('datos')}>
          <EditarUsuarioDatos
            consulta={identidad}
            formId={ID_FORMULARIO}
            register={registrar}
            errors={errors}
            enviando={isPending}
            onSubmit={formulario.handleSubmit(enviar, alInvalido)}
            resumen={resumen}
            onIrAlCampo={irAlCampo}
          />
        </div>
        <div {...panelDe('roles')}>
          <EditarUsuarioRoles usuario={usuario} />
        </div>
        <div {...panelDe('acceso')}>
          <EditarUsuarioAcceso
            usuario={usuario}
            estados={estados}
            onCerrarPanel={alTerminarEnAcceso}
          />
        </div>
      </div>
    </SidePanel>
  );
}
