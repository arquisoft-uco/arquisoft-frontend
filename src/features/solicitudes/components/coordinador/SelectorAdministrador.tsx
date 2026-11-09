import type { UseFormRegisterReturn } from 'react-hook-form';
import type { AdministradorVigente } from '../../../../shared/models/AdministradorVigente';
import SelectorDestinatario from '../SelectorDestinatario';
import type { EstadoSelectorDestinatario } from '../SelectorDestinatario';

export type EstadoSelectorAdministrador = EstadoSelectorDestinatario;

const TEXTOS: Record<EstadoSelectorAdministrador, string> = {
  cargando: 'Cargando administradores…',
  vacio: 'No hay administradores vigentes',
  error: 'No se pudieron cargar los administradores',
  listo: 'Selecciona un administrador',
};

interface Props {
  etiqueta: string;
  estado: EstadoSelectorAdministrador;
  administradores: AdministradorVigente[];
  registro: UseFormRegisterReturn;
  error?: string;
}

export default function SelectorAdministrador({
  etiqueta,
  estado,
  administradores,
  registro,
  error,
}: Props) {
  return (
    <SelectorDestinatario
      etiqueta={etiqueta}
      estado={estado}
      opciones={administradores.map((administrador) => ({
        clave: administrador.id,
        valor: administrador.id,
        etiqueta: `${administrador.nombre} (${administrador.email})`,
      }))}
      textos={TEXTOS}
      registro={registro}
      error={error}
    />
  );
}
