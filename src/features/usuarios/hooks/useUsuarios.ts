import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO, PredicadoFiltro } from '../../../shared/models/query-criteria';
import type { Rol } from '../../../shared/models/rol';
import type { ConsultarUsuariosRequest } from '../models/ConsultarUsuariosRequest';
import { usuariosService } from '../services/usuariosService';
import { ROLES_USUARIO } from '../utils/roles-usuario';

const PAGE_SIZE = 10;
const CAMPOS_DE_TEXTO = ['nombre', 'email', 'identificador'];

export type OrdenCampo = 'nombre' | 'identificador';
export type OrdenDireccion = 'ASC' | 'DESC';

interface EstadoListado {
  page: number;
  texto: string;
  rolesSeleccionados: Rol[];
  estado: string | undefined;
  vigente: boolean | undefined;
  ordenCampo: OrdenCampo;
  ordenDireccion: OrdenDireccion;
}

const ESTADO_INICIAL: EstadoListado = {
  page: 0,
  texto: '',
  rolesSeleccionados: [],
  estado: undefined,
  vigente: undefined,
  ordenCampo: 'nombre',
  ordenDireccion: 'ASC',
};

const CAMPO_ROL = new Map<Rol, string>(ROLES_USUARIO.map(({ rol, campo }) => [rol, campo]));

function predicado(campo: string, operador: string, valor: string): PredicadoFiltro {
  return { tipo: 'PREDICADO', campo, operador, valor };
}

function unir(conector: 'AND' | 'OR', nodos: NodoFiltroDTO[]): NodoFiltroDTO | undefined {
  if (nodos.length === 0) return undefined;
  if (nodos.length === 1) return nodos[0];
  return { tipo: 'GRUPO', conector, nodos };
}

export function construirFiltro(
  rolesSeleccionados: Rol[],
  estado?: string,
  vigente?: boolean,
  texto?: string,
): NodoFiltroDTO | undefined {
  const textoRecortado = texto?.trim() ?? '';
  const nodosRol = rolesSeleccionados.flatMap((rol) => {
    const campo = CAMPO_ROL.get(rol);
    return campo === undefined ? [] : [predicado(campo, 'ES', 'true')];
  });
  const nodosTexto =
    textoRecortado === ''
      ? []
      : CAMPOS_DE_TEXTO.map((campo) => predicado(campo, 'CONTIENE', textoRecortado));

  const nodos: NodoFiltroDTO[] = [];
  const grupoRoles = unir('OR', nodosRol);
  if (grupoRoles) nodos.push(grupoRoles);
  const grupoTexto = unir('OR', nodosTexto);
  if (grupoTexto) nodos.push(grupoTexto);
  if (estado !== undefined) nodos.push(predicado('estado', 'ES', estado));
  if (vigente !== undefined) nodos.push(predicado('vigente', 'ES', String(vigente)));

  return unir('AND', nodos);
}

export function useUsuarios() {
  const [listado, setListado] = useState(ESTADO_INICIAL);
  const { page, texto, rolesSeleccionados, estado, vigente, ordenCampo, ordenDireccion } = listado;

  function cambiar(cambio: Partial<EstadoListado>) {
    setListado((actual) => ({ ...actual, ...cambio, page: 0 }));
  }

  function goToPage(pagina: number) {
    setListado((actual) => ({ ...actual, page: pagina }));
  }

  function setTexto(valor: string) {
    cambiar({ texto: valor });
  }

  function toggleRol(rol: Rol) {
    setListado((actual) => ({
      ...actual,
      rolesSeleccionados: actual.rolesSeleccionados.includes(rol)
        ? actual.rolesSeleccionados.filter((r) => r !== rol)
        : [...actual.rolesSeleccionados, rol],
      page: 0,
    }));
  }

  function limpiarRoles() {
    cambiar({ rolesSeleccionados: [] });
  }

  function setEstado(valor: string | undefined) {
    cambiar({ estado: valor });
  }

  function setVigente(valor: boolean | undefined) {
    cambiar({ vigente: valor });
  }

  function setOrden(campo: OrdenCampo, direccion: OrdenDireccion = 'ASC') {
    cambiar({ ordenCampo: campo, ordenDireccion: direccion });
  }

  function limpiarFiltros() {
    cambiar({ texto: '', rolesSeleccionados: [], estado: undefined, vigente: undefined });
  }

  const query = useQuery({
    queryKey: [
      'usuarios',
      'listado',
      page,
      texto.trim(),
      rolesSeleccionados,
      estado,
      vigente,
      ordenCampo,
      ordenDireccion,
    ],
    queryFn: () => {
      const request: ConsultarUsuariosRequest = {
        pagina: page,
        tamanio: PAGE_SIZE,
        ordenamiento: [`${ordenCampo}:${ordenDireccion}`],
        filtros: construirFiltro(rolesSeleccionados, estado, vigente, texto),
      };
      return usuariosService.consultarUsuariosAdministrador(request);
    },
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage,
    texto,
    setTexto,
    rolesSeleccionados,
    toggleRol,
    limpiarRoles,
    estado,
    setEstado,
    vigente,
    setVigente,
    ordenCampo,
    ordenDireccion,
    setOrden,
    limpiarFiltros,
  };
}
