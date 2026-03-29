import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

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
  /** Extend this array as you add new feature domains */
  protected readonly navItems: NavItem[] = [
    { label: 'Inicio', icon: 'home', route: '/dashboard' },
    // Add domain nav items here, e.g.:
    // { label: 'Inventario', icon: 'inventory', route: '/inventory' },
    // { label: 'Administración', icon: 'admin_panel_settings', route: '/admin', roles: ['admin'] },
  ];
}
