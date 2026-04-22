import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { KeycloakService } from '../../core/auth/keycloak.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Bienvenido, {{ keycloak.username() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Selecciona un módulo del menú lateral para comenzar.</p>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
})
export class DashboardComponent {
  protected readonly keycloak = inject(KeycloakService);
}
