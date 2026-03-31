import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, University } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { ShellComponent } from '../shell/shell';
import { RolActivoService } from '../../auth/rol-activo.service';
import { NavItemData } from '../../../app.routes';

export interface NavItem {
  label: string;
  icon: LucideIconData;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
})
export class AppSidebarComponent {
  private readonly _router = inject(Router);
  private readonly _rolActivoService = inject(RolActivoService);

  protected readonly UniversityIcon: LucideIconData = University;

  protected readonly navItems = computed<NavItem[]>(() => {
    const rolActivo = this._rolActivoService.rolActivo();

    // Encontrar los hijos del Shell (ruta raíz del layout)
    const shellRoute = this._router.config.find(r => r.component === ShellComponent);
    const children = shellRoute?.children ?? [];

    return children
      .filter(route => {
        if (!route.path || !route.data?.['navItem']) return false;

        // Visibilidad por rol: ocultar cuando el rol activo no está entre los requeridos
        const rolesRequeridos: string[] = route.data['roles'] ?? [];
        if (rolesRequeridos.length > 0) {
          return rolActivo !== null && rolesRequeridos.includes(rolActivo);
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
