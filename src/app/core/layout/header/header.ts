import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { LucideAngularModule, Menu, UserCog, CircleUser, LogOut, ChevronDown } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { KeycloakService } from '../../auth/keycloak.service';
import { RolActivoService } from '../../auth/rol-activo.service';
import { Rol, ETIQUETAS_ROL } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  host: {
    '(document:click)': 'closeMenus()',
    '(document:keydown.escape)': 'closeMenus()',
  },
})
export class AppHeaderComponent {
  protected readonly keycloak = inject(KeycloakService);
  protected readonly rolActivoService = inject(RolActivoService);

  readonly menuToggled = output<void>();

  protected readonly MenuIcon: LucideIconData = Menu;
  protected readonly UserCogIcon: LucideIconData = UserCog;
  protected readonly CircleUserIcon: LucideIconData = CircleUser;
  protected readonly LogOutIcon: LucideIconData = LogOut;
  protected readonly ChevronDownIcon: LucideIconData = ChevronDown;

  protected readonly rolMenuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);

  protected readonly etiquetaRolActivo = computed(() => {
    const rol = this.rolActivoService.rolActivo();
    return rol ? ETIQUETAS_ROL[rol] : 'Sin rol';
  });

  protected readonly tieneMultiplesRoles = computed(
    () => this.rolActivoService.rolesDisponibles().length > 1,
  );

  protected etiquetaDeRol(rol: Rol): string {
    return ETIQUETAS_ROL[rol];
  }

  toggleRolMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.rolMenuOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update(v => !v);
    this.rolMenuOpen.set(false);
  }

  closeMenus(): void {
    this.rolMenuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  seleccionarRol(rol: Rol): void {
    this.rolActivoService.seleccionarRol(rol);
    this.closeMenus();
  }

  logout(): void {
    this.closeMenus();
    this.keycloak.logout();
  }
}

