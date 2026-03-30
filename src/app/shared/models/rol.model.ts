/**
 * Roles de usuario reconocidos por el sistema.
 * Los valores coinciden con los roles configurados en el cliente de Keycloak.
 */
export enum Rol {
  Administrador = 'administrador',
  Asesor = 'asesor',
  AsesorFicha = 'asesor_ficha',
  Estudiante = 'estudiante',
  Jurado = 'jurado',
  Coordinador = 'coordinador',
  Bibliotecario = 'bibliotecario',
  RepresentanteComiteCurriculum = 'representante_comite_curriculum',
}

/** Etiquetas en español para mostrar en la interfaz */
export const ETIQUETAS_ROL: Record<Rol, string> = {
  [Rol.Administrador]: 'Administrador',
  [Rol.Asesor]: 'Asesor',
  [Rol.AsesorFicha]: 'Asesor de Ficha',
  [Rol.Estudiante]: 'Estudiante',
  [Rol.Jurado]: 'Jurado',
  [Rol.Coordinador]: 'Coordinador',
  [Rol.Bibliotecario]: 'Bibliotecario',
  [Rol.RepresentanteComiteCurriculum]: 'Representante del Comité de Currículum',
};

/** Iconos de Material Design para cada rol */
export const ICONOS_ROL: Record<Rol, string> = {
  [Rol.Administrador]: 'admin_panel_settings',
  [Rol.Asesor]: 'supervisor_account',
  [Rol.AsesorFicha]: 'assignment_ind',
  [Rol.Estudiante]: 'school',
  [Rol.Jurado]: 'gavel',
  [Rol.Coordinador]: 'manage_accounts',
  [Rol.Bibliotecario]: 'menu_book',
  [Rol.RepresentanteComiteCurriculum]: 'groups',
};
