import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { KeycloakService } from '../../auth/keycloak.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule],
})
export class AppHeaderComponent {
  protected readonly keycloak = inject(KeycloakService);

  readonly menuToggled = output<void>();

  logout(): void {
    this.keycloak.logout();
  }
}
