import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { KeycloakService } from '../../core/auth/keycloak.service';

/**
 * Structural directive that shows content only when the user has at least one of
 * the specified realm roles.
 *
 * Usage:
 * ```html
 * <button *hasRole="['admin', 'manager']">Delete</button>
 * ```
 */
@Directive({
  selector: '[hasRole]',
})
export class HasRoleDirective {
  private readonly _keycloak = inject(KeycloakService);
  private readonly _templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly _viewContainer = inject(ViewContainerRef);

  readonly hasRole = input.required<string[]>();

  constructor() {
    effect(() => {
      const roles = this.hasRole();
      this._viewContainer.clear();
      if (this._keycloak.authenticated() && this._keycloak.hasAnyRole(roles)) {
        this._viewContainer.createEmbeddedView(this._templateRef);
      }
    });
  }
}
