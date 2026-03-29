import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ShellComponent } from '../shell/shell';
import { KeycloakService } from '../../auth/keycloak.service';
import { NavItemData } from '../../../app.routes';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
})
export class AppSidebarComponent {
  private readonly _router = inject(Router);
  private readonly _keycloak = inject(KeycloakService);

  /**
   * Derives the sidebar items automatically from the route configuration.
   *
   * A route is included when it has `data.navItem` set.
   * If `data.roles` is also present, the item is shown only when the current
   * user has at least one of the required roles (same logic as `roleGuard`).
   *
   * Update `app.routes.ts` to add or remove sidebar entries — no changes needed here.
   */
  protected readonly navItems = computed<NavItem[]>(() => {
    const userRoles = this._keycloak.roles();

    // Find the Shell children (the root layout route)
    const shellRoute = this._router.config.find(r => r.component === ShellComponent);
    const children = shellRoute?.children ?? [];

    return children
      .filter(route => {
        if (!route.path || !route.data?.['navItem']) return false;

        // Role-based visibility: hide when none of the required roles match
        const requiredRoles: string[] = route.data['roles'] ?? [];
        if (requiredRoles.length > 0) {
          return requiredRoles.some(role => userRoles.includes(role));
        }

        return true;
      })
      .sort((a, b) => {
        const orderA = (a.data?.['navItem'] as NavItemData).order ?? 999;
        const orderB = (b.data?.['navItem'] as NavItemData).order ?? 999;
        return orderA - orderB;
      })
      .map(route => {
        const meta = route.data?.['navItem'] as NavItemData;
        return {
          label: meta.label,
          icon: meta.icon,
          route: `/${route.path}`,
          roles: route.data?.['roles'],
        };
      });
  });
}
