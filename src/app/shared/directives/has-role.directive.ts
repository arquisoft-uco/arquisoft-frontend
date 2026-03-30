import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { RolActivoService } from '../../core/auth/rol-activo.service';
import { Rol } from '../models/rol.model';

/**
 * Directiva estructural que muestra contenido solo cuando el rol activo
 * del usuario está dentro de los roles permitidos.
 *
 * Uso:
 * ```html
 * <button *hasRole="[Rol.Administrador, Rol.Coordinador]">Eliminar</button>
 * ```
 */
@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private readonly _rolActivoService = inject(RolActivoService);
  private readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly _viewContainer = inject(ViewContainerRef);

  readonly hasRole = input.required<Rol[]>();

  constructor() {
    effect(() => {
      const rolesPermitidos = this.hasRole();
      const rolActivo = this._rolActivoService.rolActivo();

      this._viewContainer.clear();
      if (rolActivo && rolesPermitidos.includes(rolActivo)) {
        this._viewContainer.createEmbeddedView(this._templateRef);
      }
    });
  }
}
