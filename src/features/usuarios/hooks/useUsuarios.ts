import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { NodoFiltroDTO } from '../../../shared/models/query-criteria';
import { Rol } from '../../../shared/models/rol';
import type { ConsultarUsuariosRequest } from '../models/ConsultarUsuariosRequest';
import { usuariosService } from '../services/usuariosService';

const PAGE_SIZE = 10;

type OrdenCampo = 'nombre' | 'identificador' | 'email';
type OrdenDireccion = 'ASC' | 'DESC';

const CAMPO_ROL: Partial<Record<Rol, string>> = {
  [Rol.Estudiante]: 'esEstudiante',
  [Rol.Asesor]: 'esAsesor',
  [Rol.AsesorFicha]: 'esAsesorFicha',
  [Rol.Coordinador]: 'esCoordinador',
  [Rol.RepresentanteComiteCurriculum]: 'esRepresentanteComite',
  [Rol.Administrador]: 'esAdministrador',
};

export function construirFiltro(
  rolesSeleccionados: Rol[],
  estado?: string,
  vigente?: boolean,
): NodoFiltroDTO | undefined {
  const nodosRol: NodoFiltroDTO[] = rolesSeleccionados
    .map((rol) => CAMPO_ROL[rol])
    .filter((campo): campo is string => campo !== undefined)
    .map((campo) => ({ tipo: 'PREDICADO' as const, campo, operador: 'ES', valor: 'true' }));

  const nodoRoles: NodoFiltroDTO | undefined =
    nodosRol.length === 0
      ? undefined
      : nodosRol.length === 1
        ? nodosRol[0]
        : { tipo: 'GRUPO' as const, conector: 'OR' as const, nodos: nodosRol };

  const otrosNodos: NodoFiltroDTO[] = [];
  if (estado !== undefined) {
    otrosNodos.push({ tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: estado });
  }
  if (vigente !== undefined) {
    otrosNodos.push({
      tipo: 'PREDICADO',
      campo: 'vigente',
      operador: 'ES',
      valor: String(vigente),
    });
  }

  const nodos: NodoFiltroDTO[] = [
    ...(nodoRoles ? [nodoRoles] : []),
    ...otrosNodos,
  ];

  if (nodos.length === 0) {
    return undefined;
  }
  if (nodos.length === 1) {
    return nodos[0];
  }
  return { tipo: 'GRUPO', conector: 'AND', nodos };
}

export function useUsuarios() {
  const [page, setPage] = useState(0);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<Rol[]>([]);
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [vigente, setVigente] = useState<boolean | undefined>(undefined);
  const [ordenCampo, setOrdenCampo] = useState<OrdenCampo | undefined>(undefined);
  const [ordenDireccion, setOrdenDireccion] = useState<OrdenDireccion>('ASC');

  function toggleRol(rol: Rol) {
    setRolesSeleccionados((actuales) =>
      actuales.includes(rol) ? actuales.filter((r) => r !== rol) : [...actuales, rol],
    );
  }

  function setOrden(campo: OrdenCampo | undefined, direccion: OrdenDireccion = 'ASC') {
    setOrdenCampo(campo);
    setOrdenDireccion(direccion);
  }

  const query = useQuery({
    queryKey: [
      'usuarios',
      'listado',
      page,
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
        ordenamiento: ordenCampo ? [`${ordenCampo}:${ordenDireccion}`] : undefined,
        filtros: construirFiltro(rolesSeleccionados, estado, vigente),
      };
      return usuariosService.consultarUsuariosAdministrador(request);
    },
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
    rolesSeleccionados,
    toggleRol,
    estado,
    setEstado,
    vigente,
    setVigente,
    ordenCampo,
    ordenDireccion,
    setOrden,
  };
}
