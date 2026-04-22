import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeycloakService } from '../../auth/keycloak.service';
import { RolActivoService } from '../../auth/rol-activo.service';
import { Rol, ETIQUETAS_ROL } from '../../../shared/models/rol.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
})
export class AppHeaderComponent {
  protected readonly keycloak = inject(KeycloakService);
  protected readonly rolActivoService = inject(RolActivoService);

  readonly menuToggled = output<void>();

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

  seleccionarRol(rol: Rol): void {
    this.rolActivoService.seleccionarRol(rol);
  }

  logout(): void {
    this.keycloak.logout();
  }
}
