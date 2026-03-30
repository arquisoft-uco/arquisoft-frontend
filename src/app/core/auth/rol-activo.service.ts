import { computed, inject, Injectable, signal } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import { Rol } from '../../shared/models/rol.model';

const CLAVE_ALMACENAMIENTO = 'arquisoft_rol_activo';

const VALORES_ROL = new Set<string>(Object.values(Rol));

function esRolValido(valor: unknown): valor is Rol {
  return typeof valor === 'string' && VALORES_ROL.has(valor);
}

@Injectable({ providedIn: 'root' })
export class RolActivoService {
  private readonly _keycloak = inject(KeycloakService);

  /** Roles del token del usuario filtrados al enum Rol reconocido por el sistema */
  readonly rolesDisponibles = computed<Rol[]>(() =>
    this._keycloak.roles().filter(esRolValido),
  );

  private readonly _rolSeleccionado = signal<Rol | null>(this._leerRolAlmacenado());

  /**
   * Rol activo con el que el usuario elige interactuar.
   * Se auto-selecciona si el usuario dispone de un único rol disponible.
   * Retorna `null` cuando el usuario debe elegir su rol manualmente.
   */
  readonly rolActivo = computed<Rol | null>(() => {
    const seleccionado = this._rolSeleccionado();
    const disponibles = this.rolesDisponibles();

    if (seleccionado && disponibles.includes(seleccionado)) return seleccionado;
    if (disponibles.length === 1) return disponibles[0];
    return null;
  });

  /** Establece el rol activo y lo persiste en almacenamiento local */
  seleccionarRol(rol: Rol): void {
    this._persistirRol(rol);
    this._rolSeleccionado.set(rol);
  }

  private _leerRolAlmacenado(): Rol | null {
    try {
      const almacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      return esRolValido(almacenado) ? almacenado : null;
    } catch {
      return null;
    }
  }

  private _persistirRol(rol: Rol): void {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, rol);
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }
}
